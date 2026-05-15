/**
 * Plagiarism Detection Engine
 * Algorithm: TF-IDF weighted Cosine Similarity
 *
 * Steps:
 * 1. Tokenize & normalize text (lowercase, remove punctuation, stop words)
 * 2. Build TF (term frequency) vectors for each document
 * 3. Compute IDF (inverse document frequency) across the corpus
 * 4. Multiply TF × IDF to get weighted vectors
 * 5. Cosine similarity between two vectors = dot product / (|A| × |B|)
 */

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might",
  "this","that","these","those","it","its","i","we","you","he","she","they",
  "my","your","our","their","as","if","so","not","no","nor","yet","both",
  "either","each","few","more","most","other","some","such","than","then",
  "too","very","just","also","about","above","after","before","between",
  "into","through","during","including","until","against","among","throughout",
  "despite","towards","upon","concerning","of","to","in","for","on","with",
  "at","by","from","up","about","into","through","during","before","after",
]);

/**
 * Tokenize text into normalized terms
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Compute term frequency map for a token array
 */
function computeTF(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  const total = tokens.length || 1;
  for (const key in tf) tf[key] /= total;
  return tf;
}

/**
 * Compute IDF across a corpus of TF maps
 */
function computeIDF(tfMaps) {
  const docCount = tfMaps.length;
  const idf = {};
  const allTerms = new Set(tfMaps.flatMap((tf) => Object.keys(tf)));

  for (const term of allTerms) {
    const docsWithTerm = tfMaps.filter((tf) => tf[term] !== undefined).length;
    idf[term] = Math.log((docCount + 1) / (docsWithTerm + 1)) + 1; // smoothed
  }
  return idf;
}

/**
 * Build TF-IDF vector from TF map and IDF map
 */
function buildTFIDF(tf, idf) {
  const vec = {};
  for (const term in tf) {
    vec[term] = tf[term] * (idf[term] || 1);
  }
  return vec;
}

/**
 * Cosine similarity between two TF-IDF vectors
 */
function cosineSimilarity(vecA, vecB) {
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;

  for (const term of allTerms) {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Main function: compare one new submission against all existing submissions
 *
 * @param {string} newText - The new student's submission text
 * @param {Array<{studentId, studentName, content}>} existingSubmissions
 * @returns {Array<{studentId, studentName, similarity}>} sorted by similarity desc
 */
export function detectPlagiarism(newText, existingSubmissions) {
  if (!existingSubmissions || existingSubmissions.length === 0) {
    return [];
  }

  // Build corpus: new text + all existing
  const allTexts = [newText, ...existingSubmissions.map((s) => s.content)];
  const allTokens = allTexts.map(tokenize);
  const allTFs = allTokens.map(computeTF);
  const idf = computeIDF(allTFs);

  const newVec = buildTFIDF(allTFs[0], idf);

  const results = existingSubmissions.map((sub, idx) => {
    const existingVec = buildTFIDF(allTFs[idx + 1], idf);
    const similarity = cosineSimilarity(newVec, existingVec);
    return {
      studentId: sub.studentId,
      studentName: sub.studentName,
      similarity: Math.round(similarity * 100), // as percentage
    };
  });

  // Sort by highest similarity first
  return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Compute overall plagiarism score = max similarity found
 */
export function computePlagiarismScore(similarities) {
  if (!similarities || similarities.length === 0) return 0;
  return Math.max(...similarities.map((s) => s.similarity));
}
