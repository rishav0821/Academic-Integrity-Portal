"""
Group Cheating Detection Module
================================
Detects potential group cheating in exam answers using NLP and clustering.

Pipeline:
  1. Preprocess text (lowercase, remove punctuation/stopwords)
  2. Convert answers to TF-IDF vectors
  3. Compute pairwise cosine similarity per question
  4. Flag suspicious pairs (similarity > threshold AND both incorrect)
  5. Cluster flagged students into groups using DBSCAN

Libraries: pandas, sklearn, nltk
"""

import re
import string
import json
import warnings
from itertools import combinations

import pandas as pd
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import DBSCAN
import numpy as np

warnings.filterwarnings("ignore")


# ──────────────────────────────────────────────────────────────────────
# 1. NLTK SETUP — Download stopwords if not already present
# ──────────────────────────────────────────────────────────────────────

def ensure_nltk_data():
    """Download required NLTK data (stopwords) if not already available."""
    try:
        stopwords.words("english")
    except LookupError:
        print("[INFO] Downloading NLTK stopwords...")
        nltk.download("stopwords", quiet=True)


# ──────────────────────────────────────────────────────────────────────
# 2. TEXT PREPROCESSING
# ──────────────────────────────────────────────────────────────────────

def preprocess_text(text):
    """
    Clean and normalize a text answer:
      - Convert to lowercase
      - Remove punctuation
      - Remove English stopwords
      - Strip extra whitespace

    Args:
        text (str): Raw answer text

    Returns:
        str: Cleaned and normalized text
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    # Lowercase
    text = text.lower()

    # Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))

    # Tokenize and remove stopwords
    stop_words = set(stopwords.words("english"))
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]

    return " ".join(tokens)


def is_short_answer(text, min_words=3):
    """
    Check if an answer is too short to be meaningfully compared.

    Args:
        text (str): Preprocessed answer text
        min_words (int): Minimum word count threshold

    Returns:
        bool: True if answer has fewer than min_words
    """
    if not text:
        return True
    return len(text.split()) < min_words


def is_correct_answer(student_answer, correct_answer):
    """
    Check whether a student's answer matches the correct answer.
    Uses preprocessed versions for fair comparison.

    Args:
        student_answer (str): Student's raw answer
        correct_answer (str): Reference correct answer

    Returns:
        bool: True if the answers are essentially identical
    """
    processed_student = preprocess_text(student_answer)
    processed_correct = preprocess_text(correct_answer)

    if not processed_student or not processed_correct:
        return False

    # Use cosine similarity to handle minor wording differences
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([processed_student, processed_correct])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return similarity > 0.90  # Very high similarity = essentially correct
    except ValueError:
        return False


# ──────────────────────────────────────────────────────────────────────
# 3. TF-IDF VECTORIZATION
# ──────────────────────────────────────────────────────────────────────

def vectorize_answers(answers):
    """
    Convert a list of preprocessed text answers into TF-IDF vectors.

    Args:
        answers (list[str]): List of cleaned answer strings

    Returns:
        scipy.sparse.csr_matrix: TF-IDF feature matrix
        TfidfVectorizer: Fitted vectorizer instance
    """
    vectorizer = TfidfVectorizer(
        max_features=5000,        # Limit vocabulary size
        ngram_range=(1, 2),       # Use unigrams and bigrams for better matching
        sublinear_tf=True,        # Apply sublinear TF scaling
        min_df=1                  # Allow rare terms (important for small datasets)
    )

    tfidf_matrix = vectorizer.fit_transform(answers)
    return tfidf_matrix, vectorizer


# ──────────────────────────────────────────────────────────────────────
# 4. PAIRWISE SIMILARITY COMPUTATION
# ──────────────────────────────────────────────────────────────────────

def compute_pairwise_similarity(tfidf_matrix):
    """
    Compute cosine similarity between all pairs of TF-IDF vectors.

    Args:
        tfidf_matrix (scipy.sparse.csr_matrix): TF-IDF feature matrix

    Returns:
        numpy.ndarray: Symmetric similarity matrix (n x n)
    """
    return cosine_similarity(tfidf_matrix)


# ──────────────────────────────────────────────────────────────────────
# 5. SUSPICIOUS PAIR DETECTION
# ──────────────────────────────────────────────────────────────────────

def find_suspicious_pairs(question_df, similarity_matrix, threshold=0.8):
    """
    Identify pairs of students with suspiciously similar INCORRECT answers.

    Rules:
      - Similarity must exceed the threshold (default 0.8)
      - Both students' answers must be INCORRECT
      - Identical correct answers are ignored
      - Very short answers (< 3 words) are ignored

    Args:
        question_df (pd.DataFrame): Filtered dataframe for one question
        similarity_matrix (numpy.ndarray): Pairwise similarity matrix
        threshold (float): Minimum similarity score to flag (0.0 - 1.0)

    Returns:
        list[dict]: Suspicious pairs with student IDs and similarity scores
    """
    suspicious = []
    student_ids = question_df["student_id"].tolist()
    n = len(student_ids)

    for i, j in combinations(range(n), 2):
        sim_score = similarity_matrix[i][j]

        # Check if similarity exceeds threshold
        if sim_score > threshold:
            row_i = question_df.iloc[i]
            row_j = question_df.iloc[j]

            # Skip if either answer is too short (already preprocessed)
            if is_short_answer(row_i["processed_answer"]) or \
               is_short_answer(row_j["processed_answer"]):
                continue

            # Skip if BOTH answers are correct (legitimate similarity)
            if row_i["is_correct"] and row_j["is_correct"]:
                continue

            suspicious.append({
                "student_a": student_ids[i],
                "student_b": student_ids[j],
                "similarity_score": round(float(sim_score), 4),
                "answer_a_correct": bool(row_i["is_correct"]),
                "answer_b_correct": bool(row_j["is_correct"]),
            })

    return suspicious


# ──────────────────────────────────────────────────────────────────────
# 6. DBSCAN CLUSTERING — Group Similar Students
# ──────────────────────────────────────────────────────────────────────

def cluster_suspicious_students(suspicious_pairs, all_students):
    """
    Group flagged students into cheating clusters using DBSCAN.

    Converts pairwise similarity into a distance matrix, then applies
    DBSCAN to find dense clusters of students with similar answers.

    Args:
        suspicious_pairs (list[dict]): Flagged student pairs
        all_students (list[str]): All unique student IDs involved

    Returns:
        dict: Mapping of cluster_id → list of student IDs
              (cluster_id = -1 means noise/unclustered)
    """
    if not suspicious_pairs or len(all_students) < 2:
        return {}

    # Build a student index mapping
    student_list = sorted(set(all_students))
    student_idx = {s: i for i, s in enumerate(student_list)}
    n = len(student_list)

    # Create distance matrix (1 - similarity) — DBSCAN uses distance
    distance_matrix = np.ones((n, n))
    np.fill_diagonal(distance_matrix, 0)

    for pair in suspicious_pairs:
        i = student_idx[pair["student_a"]]
        j = student_idx[pair["student_b"]]
        dist = 1.0 - pair["similarity_score"]
        distance_matrix[i][j] = dist
        distance_matrix[j][i] = dist

    # DBSCAN clustering with precomputed distance matrix
    # eps=0.3 means similarity > 0.7 to be in the same neighborhood
    # min_samples=2 means at least 2 students to form a cluster
    clustering = DBSCAN(
        eps=0.3,
        min_samples=2,
        metric="precomputed"
    ).fit(distance_matrix)

    # Group students by cluster label
    clusters = {}
    for idx, label in enumerate(clustering.labels_):
        if label == -1:
            continue  # Skip noise points (unclustered)
        label_key = int(label)
        if label_key not in clusters:
            clusters[label_key] = []
        clusters[label_key].append(student_list[idx])

    return clusters


# ──────────────────────────────────────────────────────────────────────
# 7. CONFIDENCE SCORING
# ──────────────────────────────────────────────────────────────────────

def calculate_confidence(similarity_score, group_size, both_incorrect):
    """
    Calculate a confidence level for the cheating detection.

    Factors:
      - Higher similarity → higher confidence
      - Larger group size → higher confidence
      - Both answers incorrect → higher confidence

    Args:
        similarity_score (float): Average similarity within group
        group_size (int): Number of students in the group
        both_incorrect (bool): Whether all flagged answers are incorrect

    Returns:
        str: Confidence level ("High", "Medium", or "Low")
        float: Confidence score (0.0 - 1.0)
    """
    score = 0.0

    # Similarity contributes 50% weight
    score += (similarity_score - 0.8) * 2.5  # Scale: 0.8→0, 1.0→0.5

    # Group size contributes 25% weight
    if group_size >= 4:
        score += 0.25
    elif group_size >= 3:
        score += 0.15
    elif group_size >= 2:
        score += 0.10

    # Both incorrect contributes 25% weight
    if both_incorrect:
        score += 0.25

    # Normalize to 0-1 range
    score = max(0.0, min(1.0, score))

    # Map to confidence label
    if score >= 0.6:
        level = "High"
    elif score >= 0.3:
        level = "Medium"
    else:
        level = "Low"

    return level, round(score, 4)


# ──────────────────────────────────────────────────────────────────────
# 8. MAIN DETECTION PIPELINE
# ──────────────────────────────────────────────────────────────────────

def detect_group_cheating(csv_path, similarity_threshold=0.8, min_words=3):
    """
    Main pipeline: Load CSV → Preprocess → Vectorize → Detect → Cluster → Output.

    Args:
        csv_path (str): Path to the input CSV file
        similarity_threshold (float): Minimum cosine similarity to flag (default 0.8)
        min_words (int): Minimum word count for an answer to be considered (default 3)

    Returns:
        list[dict]: Detected cheating groups in JSON-serializable format
    """

    # ── Step 1: Load and validate input data ──
    print(f"\n{'='*60}")
    print(f"  GROUP CHEATING DETECTION ENGINE")
    print(f"{'='*60}")
    print(f"\n[1/5] Loading data from: {csv_path}")

    df = pd.read_csv(csv_path)
    required_cols = {"student_id", "question_id", "answer", "correct_answer"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"CSV must contain columns: {required_cols}")

    print(f"      → Loaded {len(df)} answer records")
    print(f"      → {df['student_id'].nunique()} unique students")
    print(f"      → {df['question_id'].nunique()} unique questions")

    # ── Step 2: Preprocess all answers ──
    print(f"\n[2/5] Preprocessing text (lowercase, remove punctuation & stopwords)...")

    ensure_nltk_data()

    df["processed_answer"] = df["answer"].apply(preprocess_text)
    df["is_short"] = df["processed_answer"].apply(lambda x: is_short_answer(x, min_words))
    df["is_correct"] = df.apply(
        lambda row: is_correct_answer(row["answer"], row["correct_answer"]),
        axis=1
    )

    short_count = df["is_short"].sum()
    correct_count = df["is_correct"].sum()
    print(f"      → {short_count} short answers will be ignored (< {min_words} words)")
    print(f"      → {correct_count} correct answers identified")

    # ── Step 3: Process each question separately ──
    print(f"\n[3/5] Computing TF-IDF vectors and cosine similarity per question...")

    all_results = []
    group_counter = 1
    questions = df["question_id"].unique()

    for question_id in questions:
        q_df = df[df["question_id"] == question_id].reset_index(drop=True)
        valid_df = q_df[~q_df["is_short"]].reset_index(drop=True)

        if len(valid_df) < 2:
            print(f"      → {question_id}: Skipped (< 2 valid answers)")
            continue

        # ── Step 3a: Vectorize answers for this question ──
        processed_answers = valid_df["processed_answer"].tolist()
        tfidf_matrix, _ = vectorize_answers(processed_answers)

        # ── Step 3b: Compute pairwise similarity ──
        sim_matrix = compute_pairwise_similarity(tfidf_matrix)

        # ── Step 3c: Find suspicious pairs ──
        suspicious = find_suspicious_pairs(valid_df, sim_matrix, similarity_threshold)
        print(f"      → {question_id}: {len(suspicious)} suspicious pair(s) found")

        if not suspicious:
            continue

        # ── Step 3d: Cluster suspicious students ──
        flagged_students = set()
        for pair in suspicious:
            flagged_students.add(pair["student_a"])
            flagged_students.add(pair["student_b"])

        clusters = cluster_suspicious_students(suspicious, list(flagged_students))

        # ── Step 3e: Build output for each cluster ──
        if clusters:
            for cluster_id, students in clusters.items():
                # Calculate average similarity within cluster
                cluster_sims = [
                    p["similarity_score"] for p in suspicious
                    if p["student_a"] in students and p["student_b"] in students
                ]
                avg_sim = sum(cluster_sims) / len(cluster_sims) if cluster_sims else 0

                # Check if all answers in the group are incorrect
                all_incorrect = all(
                    not valid_df[valid_df["student_id"] == s]["is_correct"].values[0]
                    for s in students
                    if s in valid_df["student_id"].values
                )

                confidence_level, confidence_score = calculate_confidence(
                    avg_sim, len(students), all_incorrect
                )

                all_results.append({
                    "group_id": f"GRP-{group_counter:03d}",
                    "question_id": question_id,
                    "students": sorted(students),
                    "similarity_score": round(avg_sim, 4),
                    "confidence": confidence_level,
                    "confidence_score": confidence_score,
                    "all_answers_incorrect": all_incorrect,
                    "group_size": len(students),
                })
                group_counter += 1
        else:
            # No clusters formed — report pairs individually
            for pair in suspicious:
                all_incorrect = not pair["answer_a_correct"] and not pair["answer_b_correct"]
                confidence_level, confidence_score = calculate_confidence(
                    pair["similarity_score"], 2, all_incorrect
                )

                all_results.append({
                    "group_id": f"GRP-{group_counter:03d}",
                    "question_id": question_id,
                    "students": sorted([pair["student_a"], pair["student_b"]]),
                    "similarity_score": pair["similarity_score"],
                    "confidence": confidence_level,
                    "confidence_score": confidence_score,
                    "all_answers_incorrect": all_incorrect,
                    "group_size": 2,
                })
                group_counter += 1

    # ── Step 4: Generate summary statistics ──
    print(f"\n[4/5] Generating detection summary...")

    total_groups = len(all_results)
    high_conf = sum(1 for r in all_results if r["confidence"] == "High")
    med_conf = sum(1 for r in all_results if r["confidence"] == "Medium")
    low_conf = sum(1 for r in all_results if r["confidence"] == "Low")
    flagged_students = set()
    for r in all_results:
        flagged_students.update(r["students"])

    summary = {
        "total_groups_flagged": total_groups,
        "total_students_flagged": len(flagged_students),
        "high_confidence_flags": high_conf,
        "medium_confidence_flags": med_conf,
        "low_confidence_flags": low_conf,
        "questions_analyzed": len(questions),
        "total_records_processed": len(df),
    }

    # ── Step 5: Final output ──
    print(f"\n[5/5] Detection complete!")
    print(f"\n{'─'*60}")
    print(f"  SUMMARY")
    print(f"{'─'*60}")
    print(f"  Questions Analyzed    : {summary['questions_analyzed']}")
    print(f"  Records Processed     : {summary['total_records_processed']}")
    print(f"  Groups Flagged        : {summary['total_groups_flagged']}")
    print(f"  Students Flagged      : {summary['total_students_flagged']}")
    print(f"  High Confidence       : {summary['high_confidence_flags']}")
    print(f"  Medium Confidence     : {summary['medium_confidence_flags']}")
    print(f"  Low Confidence        : {summary['low_confidence_flags']}")
    print(f"{'─'*60}\n")

    output = {
        "summary": summary,
        "flagged_groups": all_results,
    }

    return output


# ──────────────────────────────────────────────────────────────────────
# UTILITY: Save results to JSON file
# ──────────────────────────────────────────────────────────────────────

def save_results(results, output_path):
    """
    Save detection results to a JSON file.

    Args:
        results (dict): Detection output from detect_group_cheating()
        output_path (str): File path for the JSON output
    """
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"[✓] Results saved to: {output_path}")
