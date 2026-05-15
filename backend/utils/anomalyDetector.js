import PerformanceRecord from "../models/PerformanceRecord.js";

/**
 * Intelligent LMS Anomaly Detection Engine (Node.js Rule-Based)
 * Analyzes academic performance patterns for inconsistencies.
 * 
 * Rules:
 *   1. Sudden Spike/Drop vs historical average (>30% deviation)
 *   2. Illogical Attendance-Marks Pattern (high attendance, very low marks)
 *   3. Assignment-Marks Mismatch (large gap between internal and exam)
 *   4. Cross-Semester Consistency Degradation (continuous decline)
 *   5. Perfect Score Suspicion (100% marks with low assignments)
 */
export const analyzeAnomalies = async (newRecord) => {
  let score = 100;
  let flags = [];

  // 1. Fetch historical records for this student
  const history = await PerformanceRecord.find({ student: newRecord.student }).populate('subject');

  // ── Rule 1: Sudden Spikes or Drops in General Performance ──
  if (history.length > 0) {
    const previousMarks = history.map(r => r.marks);
    const avgPastPerformance = previousMarks.reduce((a, b) => a + b, 0) / previousMarks.length;

    const deviation = newRecord.marks - avgPastPerformance;

    if (deviation > 30) {
      flags.push(`Unrealistic Spike: Scored ${deviation.toFixed(1)}% higher than historical average (${avgPastPerformance.toFixed(1)}%).`);
      score -= 25;
    } else if (deviation < -30) {
      flags.push(`Severe Drop: Scored ${Math.abs(deviation).toFixed(1)}% lower than historical average (${avgPastPerformance.toFixed(1)}%).`);
      score -= 25;
    }
  }

  // ── Rule 2: Illogical Attendance-Marks Pattern ──
  if (newRecord.marks < 20 && newRecord.attendance > 90) {
    flags.push("Illogical Pattern: Very high attendance (>" + newRecord.attendance + "%) but abnormally low marks (" + newRecord.marks + "%). Possible proxy attendance or exam irregularity.");
    score -= 20;
  }
  // Reverse: very low attendance but high marks
  if (newRecord.attendance < 30 && newRecord.marks > 85) {
    flags.push("Suspicious Pattern: Very low attendance (" + newRecord.attendance + "%) but high marks (" + newRecord.marks + "%). Possible unauthorized assistance.");
    score -= 20;
  }

  // ── Rule 3: Assignment-Marks Mismatch ──
  if (newRecord.assignments !== undefined && newRecord.assignments > 0) {
    const gap = Math.abs(newRecord.marks - newRecord.assignments);
    if (gap > 40) {
      const higher = newRecord.marks > newRecord.assignments ? "exam marks" : "assignment scores";
      flags.push(`Assessment Mismatch: ${gap}-point gap between exam marks (${newRecord.marks}) and assignment scores (${newRecord.assignments}). The ${higher} are disproportionately higher.`);
      score -= 15;
    }
  }

  // ── Rule 4: Cross-Semester Consistency Degradation ──
  if (history.length >= 3) {
    // Get last 3 records sorted by semester
    const sorted = [...history].sort((a, b) => (b.semester || 0) - (a.semester || 0));
    const recent3 = sorted.slice(0, 3).map(r => r.marks);
    
    // Check for continuous decline
    const isDecline = recent3.every((val, idx) => {
      if (idx === 0) return true;
      return val >= recent3[idx - 1]; // newer sems are first, so this checks decline
    });
    
    if (isDecline && recent3[0] - recent3[recent3.length - 1] > 20) {
      flags.push(`Declining Trend: Performance has been consistently declining over the last ${recent3.length} semesters (${recent3.reverse().join(" → ")}). Recommend academic counseling.`);
      score -= 10;
    }
  }

  // ── Rule 5: Perfect Score Suspicion ──
  if (newRecord.marks === 100 && (newRecord.assignments || 0) < 50) {
    flags.push("Perfect Score Alert: Student scored 100% on exam but has low internal assignment scores (" + (newRecord.assignments || 0) + "%). This pattern warrants manual review.");
    score -= 15;
  }

  // Bound score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return { score, flags };
};
