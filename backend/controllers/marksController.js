import PerformanceRecord from "../models/PerformanceRecord.js";
import Subject from "../models/Subject.js";
import { analyzeAnomalies } from "../utils/anomalyDetector.js";

// @desc    Upload marks for a student
// @route   POST /api/marks
// @access  Private/Teacher
export const uploadMarks = async (req, res) => {
  try {
    const { studentId, subjectId, semester, marks, attendance, assignments } = req.body;
    
    // Create record
    const record = new PerformanceRecord({
      student: studentId,
      subject: subjectId,
      semester,
      marks,
      attendance,
      assignments,
      teacher: req.user._id
    });
    
    // Pass entire record to our Intelligent Logic Engine
    const analysis = await analyzeAnomalies(record);
    record.consistencyScore = analysis.score;
    record.flags = analysis.flags;
    
    await record.save();
    res.status(201).json({ message: "Marks uploaded successfully", data: record });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get dashboard metrics & flags
// @route   GET /api/marks/dashboard
// @access  Private/Admin, Teacher, Student
export const getDashboardMetrics = async (req, res) => {
  try {
    let records = await PerformanceRecord.find({ student: req.user._id })
      .populate("subject", "name")
      .sort({ monthIndex: 1, semester: 1 });

    if (!records.length) {
      return res.json({ consistencyScore: 0, warnings: 0, allFlags: [], chartData: null });
    }

    // ── Aggregate stats ──────────────────────────────────────────────────────
    let totalScore = 0;
    let warnings = 0;
    let allFlags = [];

    records.forEach((rc) => {
      totalScore += rc.consistencyScore || rc.trustScore || 100;
      if (rc.flags?.length) {
        warnings += rc.flags.length;
        allFlags.push(...rc.flags);
      }
    });

    const consistencyScore = Math.round(totalScore / records.length);

    // ── Build month-wise Academic Score ──────────────────────────────────────
    // Academic Score = weighted composite of marks(40%) + attendance(25%) + assignments(25%) + trust(10%)
    const monthMap = {};

    records.forEach((rc) => {
      const label = rc.month || `Sem ${rc.semester}`;
      const idx   = rc.monthIndex ?? rc.semester ?? 0;

      if (!monthMap[label]) {
        monthMap[label] = { idx, marks: [], attendance: [], assignments: [], trust: [], aiScore: [], plagiarism: [] };
      }
      monthMap[label].marks.push(rc.marks || 0);
      monthMap[label].attendance.push(rc.attendance || 0);
      monthMap[label].assignments.push(rc.assignments || 0);
      monthMap[label].trust.push(rc.trustScore || rc.consistencyScore || 100);
      monthMap[label].aiScore.push(rc.aiScore || 0);
      monthMap[label].plagiarism.push(rc.plagiarism || 0);
    });

    const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    const sortedLabels = Object.keys(monthMap).sort((a, b) => monthMap[a].idx - monthMap[b].idx);

    const academicScores = sortedLabels.map((label) => {
      const m = monthMap[label];
      return Math.round(
        avg(m.marks) * 0.40 +
        avg(m.attendance) * 0.25 +
        avg(m.assignments) * 0.25 +
        avg(m.trust) * 0.10
      );
    });

    const marksData      = sortedLabels.map((l) => avg(monthMap[l].marks));
    const attendanceData = sortedLabels.map((l) => avg(monthMap[l].attendance));
    const assignmentData = sortedLabels.map((l) => avg(monthMap[l].assignments));

    const chartData = {
      labels: sortedLabels,
      datasets: [
        {
          label: "Academic Score",
          data: academicScores,
          borderColor: "rgb(233, 30, 140)",
          backgroundColor: "rgba(233, 30, 140, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 4,
        },
        {
          label: "Exam Marks",
          data: marksData,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.05)",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: "Attendance %",
          data: attendanceData,
          borderColor: "rgb(75, 192, 100)",
          backgroundColor: "rgba(75, 192, 100, 0.05)",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: "Assignments",
          data: assignmentData,
          borderColor: "rgb(255, 159, 64)",
          backgroundColor: "rgba(255, 159, 64, 0.05)",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    };

    // ── Anomaly flags from recent data ───────────────────────────────────────
    const recentScores = academicScores.slice(-3);
    if (recentScores.length >= 2) {
      const diff = recentScores[recentScores.length - 1] - recentScores[0];
      if (diff <= -15) allFlags.push(`Declining Trend: Academic score dropped by ${Math.abs(diff)} points in recent months.`);
      if (diff >= 15)  allFlags.push(`Improving Trend: Academic score improved by ${diff} points recently. Keep it up!`);
    }

    const latestMonth = monthMap[sortedLabels[sortedLabels.length - 1]];
    if (latestMonth && avg(latestMonth.attendance) < 75) {
      allFlags.push(`Low Attendance: Current attendance ${avg(latestMonth.attendance)}% is below the 75% threshold.`);
      warnings++;
    }
    if (latestMonth && avg(latestMonth.aiScore) > 70) {
      allFlags.push(`High AI Usage Detected: AI score ${avg(latestMonth.aiScore)}% in recent submissions.`);
      warnings++;
    }

    res.json({
      consistencyScore,
      warnings,
      allFlags: [...new Set(allFlags)],
      chartData,
      // Extra stats for cards
      latestMarks: latestMonth ? avg(latestMonth.marks) : 0,
      latestAttendance: latestMonth ? avg(latestMonth.attendance) : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
