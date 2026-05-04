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
    let records = await PerformanceRecord.find({ student: req.user._id }).populate("subject", "name");
    
    if (!records.length) {
       // Demo mode fallback: if user has no records, show STU001's records so dashboard isn't empty
       records = await PerformanceRecord.find({ studentId: "STU001" }).populate("subject", "name");
       
       if (!records.length) {
         return res.json({ consistencyScore: 0, warnings: 0, allFlags: [], chartData: null });
       }
    }

    let totalScore = 0;
    let warnings = 0;
    let allFlags = [];
    const historyBySem = {};

    records.forEach(rc => {
       totalScore += rc.consistencyScore || 100;
       const flagCount = (rc.flags && rc.flags.length) ? rc.flags.length : 0;
       warnings += flagCount;
       
       // Collect all flags from all records
       if (rc.flags && rc.flags.length > 0) {
         allFlags.push(...rc.flags);
       }
       
       const sub = rc.subject ? rc.subject.name : "Unknown Subject";
       if (!historyBySem[rc.semester]) historyBySem[rc.semester] = {};
       historyBySem[rc.semester][sub] = rc.marks;
    });

    const consistencyScore = Math.round(totalScore / records.length);
    const labels = Object.keys(historyBySem).sort(); // Semesters
    
    const subjectSets = {};
    records.forEach(rc => {
       const sub = rc.subject ? rc.subject.name : "Unknown Subject";
       subjectSets[sub] = true;
    });

    // Create chart.js datasets mapping dynamic DB subjects over sorted semesters
    const colors = ['rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(255, 205, 86)', 'rgb(54, 162, 235)'];
    let idx = 0;
    const datasets = Object.keys(subjectSets).map(sub => {
       const color = colors[idx % colors.length];
       idx++;
       return {
         label: `${sub} Performance`,
         data: labels.map(sem => historyBySem[sem][sub] || 0),
         borderColor: color,
         tension: 0.1
       };
    });

    // Deduplicate flags for cleaner display
    const uniqueFlags = [...new Set(allFlags)];

    res.json({ consistencyScore, warnings, allFlags: uniqueFlags, chartData: { labels: labels.map(l => `Sem ${l}`), datasets } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
