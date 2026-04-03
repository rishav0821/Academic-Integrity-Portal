import PerformanceRecord from "../models/PerformanceRecord.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

// @desc    Get attendance summary for dashboard
// @route   GET /api/analytics/attendance
// @access  Private/Student
export const getAttendanceSummary = async (req, res) => {
  try {
    // Only fetch for logged-in user if student
    let filter = {};
    if (req.user.role === "student") {
      filter.student = req.user._id;
    }

    const records = await PerformanceRecord.find(filter)
      .populate("subject", "name code")
      .populate("student", "name")
      .sort({ semester: 1 });

    if (!records.length) {
      return res.status(200).json({
        overallAttendance: 0,
        subjects: [],
        trends: { labels: [], data: [] },
        insight: null
      });
    }

    // Process attendance Breakdown
    let totalAttendancePercentage = 0;
    const subjectMap = {};
    const trendsBySemester = {};

    records.forEach(rc => {
      totalAttendancePercentage += rc.attendance;
      const subName = rc.subject ? rc.subject.name : "Unknown Subject";
      
      // Calculate average per subject
      if (!subjectMap[subName]) {
        subjectMap[subName] = { total: 0, count: 0, warnings: false };
      }
      subjectMap[subName].total += rc.attendance;
      subjectMap[subName].count += 1;
      
      // Calculate trends
      if (!trendsBySemester[rc.semester]) {
        trendsBySemester[rc.semester] = { total: 0, count: 0 };
      }
      trendsBySemester[rc.semester].total += rc.attendance;
      trendsBySemester[rc.semester].count += 1;
    });

    const overallAttendance = Math.round(totalAttendancePercentage / records.length);
    
    const subjects = Object.keys(subjectMap).map(sub => {
      const avg = Math.round(subjectMap[sub].total / subjectMap[sub].count);
      return {
        name: sub,
        attendance: avg,
        warning: avg < 75
      };
    });

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

// @desc    Get grading consistency across sections/evaluators
// @route   GET /api/analytics/grading-consistency
// @access  Private/Teacher, Admin
export const getGradingConsistency = async (req, res) => {
  try {
    // We group records by Subject and then by Teacher (Section/Evaluator)
    const records = await PerformanceRecord.find()
      .populate("subject", "name")
      .populate("teacher", "name");

    if (!records.length) {
      return res.status(200).json({ consistencyData: [], alerts: [], atRiskStudents: [] });
    }

    const marksData = {};
    const atRiskStudents = [];

    records.forEach(rc => {
      // Analyze At-Risk Students from advanced metrics
      if (rc.trustScore !== undefined && rc.trustScore <= 70) {
        let flagReason = "Low Trust Score";
        if (rc.plagiarism > 20) flagReason = `High Plagiarism (${rc.plagiarism}%)`;
        else if (rc.aiScore >= 80) flagReason = `High AI Usage (${rc.aiScore}%)`;
        
        atRiskStudents.push({
          id: rc._id || rc.studentId,
          name: rc.name || "Unknown Student",
          course: rc.course || "N/A",
          trustScore: rc.trustScore,
          flagReason
        });
      }

      // Support BOTH strict MongoDB legacy refs AND new flat flexible advanced metrics
      const subName = (rc.subject && rc.subject.name) ? rc.subject.name : (rc.subject || "Unknown");
      const teacherName = (rc.teacher && rc.teacher.name) ? rc.teacher.name : (rc.section ? `Section ${rc.section}` : null);

      if (!teacherName || subName === "Unknown") return;

      if (!marksData[subName]) marksData[subName] = {};
      if (!marksData[subName][teacherName]) {
        marksData[subName][teacherName] = { totalMarks: 0, count: 0 };
      }

      marksData[subName][teacherName].totalMarks += rc.marks;
      marksData[subName][teacherName].count += 1;
    });

    let consistencyData = [];
    let alerts = [];

    // Analyze anomalies
    for (const [subName, teachersMap] of Object.entries(marksData)) {
      const targetSub = { subject: subName, averages: [] };
      const averages = [];

      for (const [teacher, stats] of Object.entries(teachersMap)) {
        const avg = Math.round(stats.totalMarks / stats.count);
        targetSub.averages.push({ teacher, average: avg });
        averages.push(avg);
      }
      
      consistencyData.push(targetSub);

      // detect inconsistency if diff > 10
      if (averages.length > 1) {
        const min = Math.min(...averages);
        const max = Math.max(...averages);
        if (max - min > 10) {
          alerts.push({
            subject: subName,
            message: `Significant grading variation detected between sections. Possible evaluation bias. Max difference is ${max - min} marks.`,
            diff: max - min
          });
        }
      }
    }

    // Sort students by highest risk (lowest trust score)
    atRiskStudents.sort((a,b) => a.trustScore - b.trustScore);

    res.status(200).json({ consistencyData, alerts, atRiskStudents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
