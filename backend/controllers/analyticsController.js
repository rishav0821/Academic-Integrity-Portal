import PerformanceRecord from "../models/PerformanceRecord.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

// @desc    Get attendance summary for dashboard
// @route   GET /api/analytics/attendance
// @access  Private/Student
export const getAttendanceSummary = async (req, res) => {
  try {
    const HIST_WEIGHT = 10;

    // Step 1: Fetch this student's real daily attendance first
    const attendanceFilter = req.user.role === "student" ? { student: req.user._id } : {};
    const realAttendances = await Attendance.find(attendanceFilter).populate("subject", "name");
    const realSubjectStats = {};
    realAttendances.forEach(att => {
      const subName = att.subject?.name;
      if (!subName) return;
      if (!realSubjectStats[subName]) realSubjectStats[subName] = { present: 0, total: 0 };
      realSubjectStats[subName].total += 1;
      if (att.status === "present") realSubjectStats[subName].present += 1;
    });
    const hasRealData = Object.keys(realSubjectStats).length > 0;

    // Step 2: Fetch PerformanceRecord for this student
    let perfFilter = {};
    if (req.user.role === "student") perfFilter.student = req.user._id;
    let records = await PerformanceRecord.find(perfFilter)
      .populate("subject", "name code")
      .populate("student", "name")
      .sort({ semester: 1 });

    const hasOwnPerfRecord = records.some(r => r.attendance && r.attendance > 0);

    // Step 3: Fallback to STU001 demo data ONLY if student has NO real attendance AND NO own PerformanceRecord
    if (!hasRealData && !hasOwnPerfRecord) {
      records = await PerformanceRecord.find({ studentId: "STU001" })
        .populate("subject", "name code")
        .sort({ semester: 1 });
    }

    if (!records.length && !hasRealData) {
      return res.status(200).json({
        overallAttendance: 0,
        subjects: [],
        trends: { labels: [], data: [] },
        insight: null
      });
    }

    // Step 4: Build subjectMap and trends from PerformanceRecord
    let totalAttendancePercentage = 0;
    const subjectMap = {};
    const trendsBySemester = {};

    records.forEach(rc => {
      totalAttendancePercentage += (rc.attendance || 0);
      const subName = (rc.subject && rc.subject.name) ? rc.subject.name
        : (typeof rc.subject === "string" ? rc.subject : "Unknown Subject");
      if (!subjectMap[subName]) subjectMap[subName] = { total: 0, count: 0 };
      subjectMap[subName].total += rc.attendance || 0;
      subjectMap[subName].count += 1;
      if (!trendsBySemester[rc.semester]) trendsBySemester[rc.semester] = { total: 0, count: 0 };
      trendsBySemester[rc.semester].total += rc.attendance || 0;
      trendsBySemester[rc.semester].count += 1;
    });

    // Step 5: Build final subjects from UNION of PerformanceRecord + real attendance
    const allSubjectNames = new Set([...Object.keys(subjectMap), ...Object.keys(realSubjectStats)]);
    const subjects = [];

    allSubjectNames.forEach(sub => {
      const hasHist = !!subjectMap[sub];
      const hasReal = !!(realSubjectStats[sub] && realSubjectStats[sub].total > 0);
      let finalAvg;

      if (hasHist && hasReal) {
        // Blend: PerformanceRecord as weighted historical base + real daily records
        const histAvg     = Math.round(subjectMap[sub].total / subjectMap[sub].count);
        const histCount   = subjectMap[sub].count;
        const histPresent = Math.round(histAvg / 100 * histCount * HIST_WEIGHT);
        const histTotal   = histCount * HIST_WEIGHT;
        finalAvg = Math.round(((histPresent + realSubjectStats[sub].present) / (histTotal + realSubjectStats[sub].total)) * 100);
      } else if (hasReal) {
        // Only real data (no PerformanceRecord for this subject)
        finalAvg = Math.round((realSubjectStats[sub].present / realSubjectStats[sub].total) * 100);
      } else {
        // Only historical data
        finalAvg = Math.round(subjectMap[sub].total / subjectMap[sub].count);
      }

      subjects.push({ name: sub, attendance: finalAvg, warning: finalAvg < 75 });
    });

    // Step 6: Compute overall attendance
    let overallAttendance;
    if (hasRealData) {
      // Blend overall: all subjects' historical + real counts
      let histPresent = 0, histTotal = 0;
      Object.keys(subjectMap).forEach(sub => {
        const ha = Math.round(subjectMap[sub].total / subjectMap[sub].count);
        const hc = subjectMap[sub].count;
        histPresent += Math.round(ha / 100 * hc * HIST_WEIGHT);
        histTotal   += hc * HIST_WEIGHT;
      });
      let realP = 0, realT = 0;
      Object.values(realSubjectStats).forEach(s => { realP += s.present; realT += s.total; });
      overallAttendance = Math.round(((histPresent + realP) / (histTotal + realT)) * 100);
    } else {
      overallAttendance = subjects.length
        ? Math.round(subjects.reduce((s, sub) => s + sub.attendance, 0) / subjects.length)
        : Math.round(totalAttendancePercentage / (records.length || 1));
    }

    const trendLabels = Object.keys(trendsBySemester).sort();
    const trendData = trendLabels.map(sem =>
      Math.round(trendsBySemester[sem].total / trendsBySemester[sem].count)
    );

    let insight = null;
    if (overallAttendance < 75) {
      insight = {
        title: "Warning: Critical Attendance Shortfall",
        message: "Your overall attendance is below the 75% threshold. Data suggests a strong correlation between sub-75% attendance and a 30% drop in overall performance."
      };
    } else {
      insight = {
        title: "Good Standing",
        message: "Your attendance is well above the required threshold. Maintain this consistency for optimal academic performance."
      };
    }

    res.status(200).json({
      overallAttendance,
      subjects,
      trends: {
        labels: trendLabels.map(l => `Semester ${l}`),
        data: trendData
      },
      insight
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get detailed attendance with subject breakdown + month filter
// @route   GET /api/analytics/attendance-detail?from=May 2025&to=Apr 2026
// @access  Private/Student
export const getAttendanceDetail = async (req, res) => {
  try {
    const { from, to } = req.query;

    let filter = { student: req.user._id };

    // Month index map for filtering
    const MONTH_ORDER = [
      "May 2025", "Jun 2025", "Jul 2025", "Aug 2025",
      "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
      "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026",
    ];

    const fromIdx = from ? MONTH_ORDER.indexOf(from) : 0;
    const toIdx = to ? MONTH_ORDER.indexOf(to) : MONTH_ORDER.length - 1;

    const records = await PerformanceRecord.find(filter)
      .populate("subject", "name code")
      .sort({ monthIndex: 1 });

    if (!records.length) return res.json({ overall: 0, subjects: [], monthlyTrend: [], months: MONTH_ORDER });

    // Filter by date range
    const filtered = records.filter(r => {
      const idx = r.monthIndex ?? MONTH_ORDER.indexOf(r.month);
      return idx >= fromIdx && idx <= toIdx;
    });

    if (!filtered.length) return res.json({ overall: 0, subjects: [], monthlyTrend: [], months: MONTH_ORDER });

    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    // --- REAL ATTENDANCE INJECTION (weighted blend) ---
    const HIST_WEIGHT_D = 10;
    const attendanceFilterD = { student: req.user._id };
    const realAttendances = await Attendance.find(attendanceFilterD).populate("subject", "name");
    const realSubjectStats = {};
    realAttendances.forEach(att => {
      const subName = att.subject?.name;
      if (!subName) return;
      if (!realSubjectStats[subName]) realSubjectStats[subName] = { present: 0, total: 0 };
      realSubjectStats[subName].total += 1;
      if (att.status === "present") realSubjectStats[subName].present += 1;
    });

    // Per subject from PerformanceRecord
    const subMap = {};
    filtered.forEach(r => {
      const name = r.subject?.name || "Unknown";
      if (!subMap[name]) subMap[name] = { attendance: [], marks: [], assignments: [], months: {} };
      subMap[name].attendance.push(r.attendance || 0);
      subMap[name].marks.push(r.marks || 0);
      subMap[name].assignments.push(r.assignments || 0);
      const m = r.month || `Sem ${r.semester}`;
      subMap[name].months[m] = r.attendance || 0;
    });

    const subjects = Object.entries(subMap).map(([name, d]) => {
      const histAvg   = avg(d.attendance);
      const histCount = d.attendance.length;
      let subjectAvg  = histAvg;
      if (realSubjectStats[name] && realSubjectStats[name].total > 0) {
        const histPresent = Math.round(histAvg / 100 * histCount * HIST_WEIGHT_D);
        const histTotal   = histCount * HIST_WEIGHT_D;
        subjectAvg = Math.round(((histPresent + realSubjectStats[name].present) / (histTotal + realSubjectStats[name].total)) * 100);
      }
      return {
        name,
        avgAttendance: subjectAvg,
        avgMarks: avg(d.marks),
        avgAssignments: avg(d.assignments),
        status: subjectAvg >= 75 ? "good" : subjectAvg >= 65 ? "warning" : "critical",
        monthlyBreakdown: d.months,
      };
    });

    let overall;
    if (Object.keys(realSubjectStats).length > 0) {
      let histPresent = 0, histTotal = 0;
      Object.entries(subMap).forEach(([name, d]) => {
        const ha = avg(d.attendance);
        const hc = d.attendance.length;
        histPresent += Math.round(ha / 100 * hc * HIST_WEIGHT_D);
        histTotal   += hc * HIST_WEIGHT_D;
      });
      let realP = 0, realT = 0;
      Object.values(realSubjectStats).forEach(s => { realP += s.present; realT += s.total; });
      overall = Math.round(((histPresent + realP) / (histTotal + realT)) * 100);
    } else {
      overall = subjects.length
        ? Math.round(subjects.reduce((s, sub) => s + sub.avgAttendance, 0) / subjects.length)
        : avg(filtered.map(r => r.attendance || 0));
    }

    // Monthly trend (all subjects averaged per month)
    const monthMap = {};
    filtered.forEach(r => {
      const m = r.month || `Sem ${r.semester}`;
      const idx = r.monthIndex ?? 0;
      if (!monthMap[m]) monthMap[m] = { idx, vals: [] };
      monthMap[m].vals.push(r.attendance || 0);
    });
    const sortedMonths = Object.keys(monthMap).sort((a, b) => monthMap[a].idx - monthMap[b].idx);
    const monthlyTrend = sortedMonths.map(m => ({ month: m, attendance: avg(monthMap[m].vals) }));

    res.json({ overall, subjects, monthlyTrend, months: MONTH_ORDER });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// @route   GET /api/analytics/grading-consistency
// @access  Private/Teacher, Admin
export const getGradingConsistency = async (req, res) => {
  try {
    const records = await PerformanceRecord.find()
      .populate("subject", "name")
      .populate("teacher", "name")
      .populate("student", "name email department");  // ← populate student name

    if (!records.length) {
      return res.status(200).json({ consistencyData: [], alerts: [], atRiskStudents: [] });
    }

    const marksData = {};
    const studentRiskMap = {}; // keyed by studentId to deduplicate

    records.forEach(rc => {
      // Resolve student name — prefer populated ref, fallback to flat field
      const studentName = rc.student?.name || rc.name || null;
      const studentId = rc.student?._id?.toString() || rc.studentId || null;
      const course = rc.student?.department || rc.course || "N/A";

      if (studentName && studentId && rc.trustScore !== undefined && rc.trustScore <= 70) {
        if (!studentRiskMap[studentId]) {
          studentRiskMap[studentId] = {
            id: studentId,
            name: studentName,
            course,
            trustScore: rc.trustScore,
            flagReason: "Low Trust Score",
          };
        }
        // Keep the worst (lowest) trust score entry
        if (rc.trustScore < studentRiskMap[studentId].trustScore) {
          studentRiskMap[studentId].trustScore = rc.trustScore;
        }
        // Update flag reason
        if (rc.plagiarism > 20) {
          studentRiskMap[studentId].flagReason = `High Plagiarism (${Math.round(rc.plagiarism)}%)`;
        } else if (rc.aiScore >= 80) {
          studentRiskMap[studentId].flagReason = `High AI Usage (${Math.round(rc.aiScore)}%)`;
        }
      }

      const subName = rc.subject?.name || rc.subject || "Unknown";
      const teacherName = rc.teacher?.name || (rc.section ? `Section ${rc.section}` : null);
      if (!teacherName || subName === "Unknown") return;

      if (!marksData[subName]) marksData[subName] = {};
      if (!marksData[subName][teacherName]) {
        marksData[subName][teacherName] = { totalMarks: 0, count: 0 };
      }
      marksData[subName][teacherName].totalMarks += rc.marks;
      marksData[subName][teacherName].count += 1;
    });

    const atRiskStudents = Object.values(studentRiskMap)
      .sort((a, b) => a.trustScore - b.trustScore);

    let consistencyData = [];
    let alerts = [];

    for (const [subName, teachersMap] of Object.entries(marksData)) {
      const targetSub = { subject: subName, averages: [] };
      const averages = [];
      for (const [teacher, stats] of Object.entries(teachersMap)) {
        const avg = Math.round(stats.totalMarks / stats.count);
        targetSub.averages.push({ teacher, average: avg });
        averages.push(avg);
      }
      consistencyData.push(targetSub);
      if (averages.length > 1) {
        const diff = Math.max(...averages) - Math.min(...averages);
        if (diff > 10) {
          alerts.push({
            subject: subName,
            message: `Significant grading variation detected between sections. Max difference is ${diff} marks.`,
            diff,
          });
        }
      }
    }

    res.status(200).json({ consistencyData, alerts, atRiskStudents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all students' full academic performance overview (for teacher)
// @route   GET /api/analytics/students-overview
// @access  Private/Teacher, Admin
export const getStudentsOverview = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name email department studentId");
    if (!students.length) return res.json([]);

    const overview = [];

    for (const student of students) {
      const records = await PerformanceRecord.find({ student: student._id })
        .populate("subject", "name")
        .sort({ monthIndex: 1 });

      if (!records.length) continue;

      const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      const marks = records.map(r => r.marks || 0);
      const attendance = records.map(r => r.attendance || 0);
      const assignments = records.map(r => r.assignments || 0);
      const aiScores = records.map(r => r.aiScore || 0);
      const plagiarism = records.map(r => r.plagiarism || 0);
      const trust = records.map(r => r.trustScore || r.consistencyScore || 100);

      // Academic score composite
      const academicScore = Math.round(
        avg(marks) * 0.40 + avg(attendance) * 0.25 + avg(assignments) * 0.25 + avg(trust) * 0.10
      );

      // Trend: compare last 3 months vs first 3 months
      const firstThree = records.slice(0, 3).map(r => r.marks || 0);
      const lastThree = records.slice(-3).map(r => r.marks || 0);
      const trendDiff = avg(lastThree) - avg(firstThree);
      const trend = trendDiff >= 5 ? "improving" : trendDiff <= -5 ? "declining" : "stable";

      // Subject-wise breakdown
      const subjectMap = {};
      records.forEach(r => {
        const sub = r.subject?.name || "Unknown";
        if (!subjectMap[sub]) subjectMap[sub] = { marks: [], attendance: [], assignments: [] };
        subjectMap[sub].marks.push(r.marks || 0);
        subjectMap[sub].attendance.push(r.attendance || 0);
        subjectMap[sub].assignments.push(r.assignments || 0);
      });

      // --- REAL ATTENDANCE INJECTION (weighted blend) ---
      const HIST_WEIGHT_O = 10;
      const realAttendances = await Attendance.find({ student: student._id }).populate("subject", "name");
      const realSubjectStats = {};
      realAttendances.forEach(att => {
        const subName = att.subject?.name;
        if (!subName) return;
        if (!realSubjectStats[subName]) realSubjectStats[subName] = { present: 0, total: 0 };
        realSubjectStats[subName].total += 1;
        if (att.status === "present") realSubjectStats[subName].present += 1;
      });

      const subjects = Object.entries(subjectMap).map(([name, d]) => {
        const histAvg   = avg(d.attendance);
        const histCount = d.attendance.length;
        let subjectAvg  = histAvg;
        if (realSubjectStats[name] && realSubjectStats[name].total > 0) {
          const histPresent = Math.round(histAvg / 100 * histCount * HIST_WEIGHT_O);
          const histTotal   = histCount * HIST_WEIGHT_O;
          subjectAvg = Math.round(((histPresent + realSubjectStats[name].present) / (histTotal + realSubjectStats[name].total)) * 100);
        }
        return {
          name,
          avgMarks:      avg(d.marks),
          avgAttendance: subjectAvg,
          avgAssignments:avg(d.assignments),
        };
      });

      let finalAvgAttendance;
      if (Object.keys(realSubjectStats).length > 0) {
        let histPresent = 0, histTotal = 0;
        Object.entries(subjectMap).forEach(([name, d]) => {
          const ha = avg(d.attendance);
          const hc = d.attendance.length;
          histPresent += Math.round(ha / 100 * hc * HIST_WEIGHT_O);
          histTotal   += hc * HIST_WEIGHT_O;
        });
        let realP = 0, realT = 0;
        Object.values(realSubjectStats).forEach(s => { realP += s.present; realT += s.total; });
        finalAvgAttendance = Math.round(((histPresent + realP) / (histTotal + realT)) * 100);
      } else {
        finalAvgAttendance = subjects.length
          ? Math.round(subjects.reduce((s, sub) => s + sub.avgAttendance, 0) / subjects.length)
          : avg(attendance);
      }

      // Monthly chart data
      const monthMap = {};
      records.forEach(r => {
        const label = r.month || `Sem ${r.semester}`;
        const idx = r.monthIndex ?? r.semester ?? 0;
        if (!monthMap[label]) monthMap[label] = { idx, marks: [], attendance: [], assignments: [] };
        monthMap[label].marks.push(r.marks || 0);
        monthMap[label].attendance.push(r.attendance || 0);
        monthMap[label].assignments.push(r.assignments || 0);
      });
      const sortedMonths = Object.keys(monthMap).sort((a, b) => monthMap[a].idx - monthMap[b].idx);
      const chartData = {
        labels: sortedMonths,
        marks: sortedMonths.map(l => avg(monthMap[l].marks)),
        attendance: sortedMonths.map(l => avg(monthMap[l].attendance)),
        assignments: sortedMonths.map(l => avg(monthMap[l].assignments)),
      };

      overview.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        department: student.department || "N/A",
        rollNo: student.studentId || "N/A",
        avgMarks: avg(marks),
        avgAttendance: finalAvgAttendance,
        avgAssignments: avg(assignments),
        avgAiScore: avg(aiScores),
        avgPlagiarism: avg(plagiarism),
        trustScore: avg(trust),
        academicScore,
        trend,
        trendDiff,
        totalRecords: records.length,
        subjects,
        chartData,
      });
    }

    overview.sort((a, b) => a.academicScore - b.academicScore); // worst first
    res.json(overview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

