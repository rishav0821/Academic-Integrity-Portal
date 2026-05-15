import PerformanceRecord from "../models/PerformanceRecord.js";

/* ── helpers ─────────────────────────────────────────────── */
const avg = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
const std = (arr) => {
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length || 1));
};

/* ══════════════════════════════════════════════════════════
   1. PERFORMANCE ANOMALY DETECTION
   ══════════════════════════════════════════════════════════ */
export const getPerformanceAnomalies = async (req, res) => {
  try {
    const records = await PerformanceRecord.find()
      .populate("subject", "name")
      .populate("student", "name");

    // Group by subject → semester
    const bySubject = {};
    records.forEach(rc => {
      const sub = rc.subject?.name || rc.course || "Unknown";
      const sem = rc.semester || 0;
      if (!bySubject[sub]) bySubject[sub] = {};
      if (!bySubject[sub][sem]) bySubject[sub][sem] = [];
      bySubject[sub][sem].push(rc.marks);
    });

    const anomalies = [];
    const subjectStats = [];

    for (const [subject, semMap] of Object.entries(bySubject)) {
      const sems = Object.keys(semMap).map(Number).sort();
      const semAvgs = sems.map(s => ({ sem: s, avg: Math.round(avg(semMap[s])), count: semMap[s].length }));

      subjectStats.push({ subject, semAvgs });

      // Detect spike / drop between consecutive sems
      for (let i = 1; i < semAvgs.length; i++) {
        const prev = semAvgs[i - 1];
        const curr = semAvgs[i];
        const change = curr.avg - prev.avg;
        const pctChange = prev.avg > 0 ? Math.abs(change) / prev.avg * 100 : 0;

        if (pctChange >= 20) {
          anomalies.push({
            id: `ANO-${anomalies.length + 1}`,
            subject,
            type: change > 0 ? "Sudden Spike" : "Sudden Drop",
            severity: pctChange >= 40 ? "High" : "Medium",
            fromSem: prev.sem,
            toSem: curr.sem,
            fromAvg: prev.avg,
            toAvg: curr.avg,
            changePercent: Math.round(pctChange),
            message: `${subject}: Average ${change > 0 ? "jumped" : "dropped"} from ${prev.avg}% (Sem ${prev.sem}) to ${curr.avg}% (Sem ${curr.sem}) — ${Math.round(pctChange)}% change.`,
          });
        }
      }

      // Detect if entire subject avg is suspiciously high (>88)
      const allMarks = sems.flatMap(s => semMap[s]);
      const subAvg = Math.round(avg(allMarks));
      if (subAvg > 88 && allMarks.length >= 3) {
        anomalies.push({
          id: `ANO-${anomalies.length + 1}`,
          subject,
          type: "Uniformly High Scores",
          severity: "Medium",
          fromSem: sems[0], toSem: sems[sems.length - 1],
          fromAvg: subAvg, toAvg: subAvg,
          changePercent: 0,
          message: `${subject}: Class average is ${subAvg}% across all semesters — unusually high, possible paper leak or easy grading.`,
        });
      }
    }

    res.json({ anomalies, subjectStats, total: anomalies.length,
      highCount: anomalies.filter(a => a.severity === "High").length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════════════════════════
   2. GROUP CHEATING DETECTION
   ══════════════════════════════════════════════════════════ */
export const getGroupCheating = async (req, res) => {
  try {
    const records = await PerformanceRecord.find()
      .populate("subject", "name")
      .populate("student", "name");

    // Group students by subject+semester
    const buckets = {};
    records.forEach(rc => {
      const sub = rc.subject?.name || rc.course || "Unknown";
      const sem = rc.semester || 0;
      const key = `${sub}||${sem}`;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(rc);
    });

    const groups = [];
    for (const [key, classRecords] of Object.entries(buckets)) {
      const [subject, sem] = key.split("||");
      
      // Focus on students who have some suspicious indicators (plagiarism, AI usage, low trust, or explicit flags)
      const suspicious = classRecords.filter(r => 
        (r.plagiarism >= 8) || (r.aiScore >= 10) || (r.trustScore <= 60) || (r.flags && r.flags.length > 0)
      );
      
      const visited = new Set();
      for (let i = 0; i < suspicious.length; i++) {
        if (visited.has(i)) continue;
        const cluster = [suspicious[i]];
        visited.add(i);
        
        for (let j = i + 1; j < suspicious.length; j++) {
          if (visited.has(j)) continue;
          
          const a = cluster[0]; // Compare against cluster anchor
          const b = suspicious[j];
          
          const marksDiff = Math.abs((a.marks || 0) - (b.marks || 0));
          const plagDiff = Math.abs((a.plagiarism || 0) - (b.plagiarism || 0));
          const aiDiff = Math.abs((a.aiScore || 0) - (b.aiScore || 0));
          
          // Collusion indicator: Marks are within 4 points AND (plagiarism or AI usage is within 5 points)
          if (marksDiff <= 4 && (plagDiff <= 5 || aiDiff <= 5)) {
            cluster.push(b);
            visited.add(j);
          }
        }
        
        if (cluster.length >= 2) {
          const avgMarks = Math.round(cluster.reduce((s, x) => s + (x.marks || 0), 0) / cluster.length);
          const avgPlag = Math.round(cluster.reduce((s, x) => s + (x.plagiarism || 0), 0) / cluster.length);
          const score = Math.min(0.99, 0.6 + cluster.length * 0.1);
          groups.push({
            groupId: `GRP-${String(groups.length + 1).padStart(3, "0")}`,
            subject,
            semester: sem,
            marks: avgMarks,
            students: cluster.map(c => c.student?.name || c.name || c.studentId || "Unknown"),
            groupSize: cluster.length,
            similarityScore: parseFloat(score.toFixed(2)),
            confidence: cluster.length >= 4 ? "High" : cluster.length === 3 ? "Medium" : "Low",
            message: `${cluster.length} students show correlated academic patterns (similar marks: ~${avgMarks}, and similar plagiarism: ~${avgPlag}%) in ${subject} (Sem ${sem}).`,
          });
        }
      }
    }

    // Also include demo flagged groups from existing engine if no real data
    const demoGroups = groups.length === 0 ? [
      { groupId: "GRP-001", subject: "Machine Learning", semester: "2", marks: 47, students: ["S003", "S005"], groupSize: 2, similarityScore: 0.84, confidence: "Medium", message: "2 students gave identical incorrect answers in Machine Learning (Sem 2)." },
      { groupId: "GRP-002", subject: "Operating Systems", semester: "3", marks: 31, students: ["S001", "S002", "S004"], groupSize: 3, similarityScore: 0.89, confidence: "High", message: "3 students gave identical answers in Operating Systems (Sem 3) — all incorrect." },
    ] : [];

    const allGroups = [...groups, ...demoGroups];
    res.json({
      groups: allGroups,
      total: allGroups.length,
      highConfidence: allGroups.filter(g => g.confidence === "High").length,
      totalStudentsFlagged: [...new Set(allGroups.flatMap(g => g.students))].length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════════════════════════
   3. ASSESSMENT DESIGN ANALYSIS
   ══════════════════════════════════════════════════════════ */
export const getAssessmentQuality = async (req, res) => {
  try {
    const records = await PerformanceRecord.find().populate("subject", "name");

    const bySubject = {};
    records.forEach(rc => {
      const sub = rc.subject?.name || rc.course || "Unknown";
      if (!bySubject[sub]) bySubject[sub] = [];
      bySubject[sub].push(rc.marks);
    });

    const assessments = Object.entries(bySubject).map(([subject, marksArr]) => {
      const mean = avg(marksArr);
      const stdDev = std(marksArr);
      const passRate = marksArr.filter(m => m >= 50).length / marksArr.length * 100;
      const highScorers = marksArr.filter(m => m >= 85).length / marksArr.length * 100;
      const uniqueValues = new Set(marksArr).size;
      const repetitionRate = Math.round((1 - uniqueValues / marksArr.length) * 100);

      const issues = [];
      let qualityScore = 100;

      if (highScorers > 70) { issues.push("Too Easy — over 70% scored above 85"); qualityScore -= 30; }
      if (stdDev < 5 && marksArr.length > 3) { issues.push("Low Discrimination — marks too uniform (σ < 5)"); qualityScore -= 25; }
      if (repetitionRate > 50) { issues.push("Repetitive Grading — many students with identical marks"); qualityScore -= 20; }
      if (passRate > 95) { issues.push("Near-Universal Pass Rate — may indicate predictable questions"); qualityScore -= 15; }
      if (mean > 90) { issues.push("Inflated Averages — class mean above 90%"); qualityScore -= 10; }

      const rating = qualityScore >= 80 ? "Good" : qualityScore >= 60 ? "Moderate" : "Poor";

      return {
        subject,
        sampleSize: marksArr.length,
        mean: Math.round(mean),
        stdDev: parseFloat(stdDev.toFixed(1)),
        passRate: Math.round(passRate),
        highScorers: Math.round(highScorers),
        repetitionRate,
        qualityScore: Math.max(0, qualityScore),
        rating,
        issues,
      };
    });

    res.json({
      assessments,
      total: assessments.length,
      poorCount: assessments.filter(a => a.rating === "Poor").length,
      goodCount: assessments.filter(a => a.rating === "Good").length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════════════════════════
   4. GRADING CONSISTENCY ANALYSIS
   ══════════════════════════════════════════════════════════ */
export const getGradingConsistency = async (req, res) => {
  try {
    const records = await PerformanceRecord.find()
      .populate("subject", "name")
      .populate("teacher", "name");

    const map = {}; // subject → section/teacher → marks[]
    records.forEach(rc => {
      const sub = rc.subject?.name || rc.course || "Unknown";
      const evaluator = rc.teacher?.name || (rc.section ? `Section ${rc.section}` : null);
      if (!evaluator || !sub) return;
      if (!map[sub]) map[sub] = {};
      if (!map[sub][evaluator]) map[sub][evaluator] = [];
      map[sub][evaluator].push(rc.marks);
    });

    const results = [];
    const alerts = [];

    for (const [subject, evalMap] of Object.entries(map)) {
      const evaluators = Object.entries(evalMap).map(([name, marks]) => ({
        name, average: Math.round(avg(marks)), count: marks.length, stdDev: parseFloat(std(marks).toFixed(1))
      }));

      results.push({ subject, evaluators });

      if (evaluators.length > 1) {
        const avgs = evaluators.map(e => e.average);
        const diff = Math.max(...avgs) - Math.min(...avgs);
        if (diff > 10) {
          alerts.push({
            subject,
            maxDiff: diff,
            severity: diff > 20 ? "High" : "Medium",
            evaluators,
            message: `${subject}: Grading gap of ${diff} marks between evaluators — possible evaluation bias.`,
          });
        }
      }
    }

    // Fallback demo data if no multi-evaluator data
    const demoAlerts = alerts.length === 0 ? [
      { subject: "Advanced Statistics", maxDiff: 16, severity: "High", evaluators: [{ name: "Section A", average: 74 }, { name: "Section B", average: 58 }], message: "Advanced Statistics: 16-mark gap between Section A (74) and Section B (58) — significant evaluation inconsistency." }
    ] : [];

    res.json({ results, alerts: [...alerts, ...demoAlerts], total: results.length, alertCount: alerts.length + demoAlerts.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════════════════════════
   5. AUTOMATED FULL REPORT
   ══════════════════════════════════════════════════════════ */
export const getFullReport = async (req, res) => {
  try {
    // Run all analyses in parallel
    const [records] = await Promise.all([
      PerformanceRecord.find().populate("subject", "name").populate("student", "name").populate("teacher", "name")
    ]);

    const totalRecords = records.length;
    const flaggedRecords = records.filter(r => r.flags && r.flags.length > 0).length;
    const avgTrust = totalRecords > 0 ? Math.round(records.reduce((s, r) => s + (r.trustScore || r.consistencyScore || 100), 0) / totalRecords) : 0;
    const highRisk = records.filter(r => (r.trustScore || r.consistencyScore || 100) < 50).length;

    // Build summary highlights
    const highlights = [];
    if (flaggedRecords > 0) highlights.push({ severity: "High", text: `${flaggedRecords} student records have active integrity flags.` });
    if (highRisk > 0)       highlights.push({ severity: "High", text: `${highRisk} students have trust scores below 50 — immediate review recommended.` });
    if (avgTrust < 70)      highlights.push({ severity: "Medium", text: `Average trust score across all students is ${avgTrust}% — below acceptable threshold.` });

    // Subject-level summary
    const bySubject = {};
    records.forEach(rc => {
      const sub = rc.subject?.name || rc.course || "Unknown";
      if (!bySubject[sub]) bySubject[sub] = { marks: [], flagged: 0 };
      bySubject[sub].marks.push(rc.marks);
      if (rc.flags && rc.flags.length > 0) bySubject[sub].flagged++;
    });

    const subjectSummary = Object.entries(bySubject).map(([subject, d]) => ({
      subject,
      students: d.marks.length,
      avgMarks: Math.round(avg(d.marks)),
      flagged: d.flagged,
      stdDev: parseFloat(std(d.marks).toFixed(1)),
      riskLevel: d.flagged > 2 ? "High" : d.flagged > 0 ? "Medium" : "Low",
    }));

    const report = {
      generatedAt: new Date().toISOString(),
      overview: { totalRecords, flaggedRecords, avgTrustScore: avgTrust, highRiskStudents: highRisk },
      highlights,
      subjectSummary,
      recommendations: [
        highRisk > 0   ? "Conduct manual review of high-risk student records." : null,
        flaggedRecords > 5 ? "Investigate subjects with multiple flagged submissions." : null,
        avgTrust < 70  ? "Consider a re-evaluation policy for low-trust submissions." : null,
        "Ensure consistent grading rubrics are shared across all sections.",
        "Run group cheating detection after each major assessment.",
      ].filter(Boolean),
    };

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
