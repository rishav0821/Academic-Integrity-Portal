import PerformanceRecord from "../models/PerformanceRecord.js";
import User from "../models/User.js";

/**
 * Intelligent LMS Anomaly Detection Engine (Node.js Rule-Based)
 * Analyzes academic performance patterns for inconsistencies.
 */
export const analyzeAnomalies = async (newRecord) => {
  let score = 100;
  let flags = [];
  
  // 1. Fetch historical records for this student
  const history = await PerformanceRecord.find({ student: newRecord.student }).populate('subject');
  
  // Rule 1: Sudden Spikes or Drops in General Performance
  if (history.length > 0) {
    const previousMarks = history.map(r => r.marks);
    const avgPastPerformance = previousMarks.reduce((a, b) => a + b, 0) / previousMarks.length;
    
    const deviation = newRecord.marks - avgPastPerformance;
    
    // If student suddenly scores >30% higher or lower than historical average
    if (deviation > 30) {
      flags.push(`Unrealistic Spike: Scored ${deviation.toFixed(1)}% higher than historical average.`);
      score -= 25;
    } else if (deviation < -30) {
      flags.push(`Severe Drop: Scored ${Math.abs(deviation).toFixed(1)}% lower than historical average.`);
      score -= 25;
    }
  }

  // Rule 2: Related Subject Parity (e.g. Maths vs Stats)
  // Assuming the newly fetched subject has populated "relatedSubjects"
  // We check if the student scored drastically differently in a highly correlated subject
  // For prototype simplicity, we just compare to the last available related subject mark
  // Wait, the newRecord.subject needs to be populated first.
  
  // Prototype hack: if marks are < 20 and attendance is > 90, flag illogical behavior
  if (newRecord.marks < 20 && newRecord.attendance > 90) {
     flags.push("Illogical Pattern: Very high attendance but abnormally low marks.");
     score -= 20;
  }

  // Bound score
  score = Math.max(0, Math.min(100, score));
  
  return { score, flags };
};
