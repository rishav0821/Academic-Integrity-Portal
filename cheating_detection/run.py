"""
Run Group Cheating Detection
=============================
Entry point to execute the cheating detection pipeline.

Usage:
    python run.py                          # Uses sample_input.csv
    python run.py --input my_data.csv      # Uses custom CSV
    python run.py --threshold 0.75         # Custom similarity threshold
"""

import argparse
import os
import json
import sys

from detector import detect_group_cheating, save_results


def main():
    parser = argparse.ArgumentParser(
        description="Group Cheating Detection Engine — Detect suspicious answer patterns"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        default="sample_input.csv",
        help="Path to the input CSV file (default: sample_input.csv)"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default="detection_results.json",
        help="Path for the output JSON file (default: detection_results.json)"
    )
    parser.add_argument(
        "--threshold", "-t",
        type=float,
        default=0.8,
        help="Cosine similarity threshold for flagging (default: 0.8)"
    )
    parser.add_argument(
        "--min-words", "-m",
        type=int,
        default=3,
        help="Minimum word count for an answer to be analyzed (default: 3)"
    )

    args = parser.parse_args()

    # Resolve paths relative to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, args.input) if not os.path.isabs(args.input) else args.input
    output_path = os.path.join(script_dir, args.output) if not os.path.isabs(args.output) else args.output

    # Validate input file exists
    if not os.path.exists(input_path):
        print(f"[ERROR] Input file not found: {input_path}")
        sys.exit(1)

    # ── Run the detection pipeline ──
    results = detect_group_cheating(
        csv_path=input_path,
        similarity_threshold=args.threshold,
        min_words=args.min_words
    )

    # ── Save results to JSON ──
    save_results(results, output_path)

    # ── Print the detected groups ──
    print(f"\n{'='*60}")
    print(f"  DETECTED CHEATING GROUPS")
    print(f"{'='*60}\n")

    if not results["flagged_groups"]:
        print("  No suspicious groups detected.\n")
    else:
        for group in results["flagged_groups"]:
            conf_color = {
                "High": "🔴",
                "Medium": "🟡",
                "Low": "🟢"
            }.get(group["confidence"], "⚪")

            print(f"  {conf_color} {group['group_id']} | {group['question_id']}")
            print(f"     Students      : {', '.join(group['students'])}")
            print(f"     Similarity    : {group['similarity_score']:.2%}")
            print(f"     Confidence    : {group['confidence']} ({group['confidence_score']:.2%})")
            print(f"     All Incorrect : {'Yes' if group['all_answers_incorrect'] else 'No'}")
            print()

    # ── Pretty print JSON output ──
    print(f"{'='*60}")
    print(f"  JSON OUTPUT")
    print(f"{'='*60}\n")
    print(json.dumps(results, indent=2))

    return results


if __name__ == "__main__":
    main()
