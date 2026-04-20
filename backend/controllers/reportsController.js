import PerformanceRecord from "../models/PerformanceRecord.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

/**
 * @desc    Get all integrity scan logs for the Reports page
 * @route   GET /api/reports
 * @access  Private/Teacher, Admin
 */
export const getReportLogs = async (req, res) => {
  try {
    const { search, status, sortBy } = req.query;

    // Fetch all performance records with populated refs
    const records = await PerformanceRecord.find()
      .populate("student", "name email")
      .populate("subject", "name code")
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    // Transform records into report log format
    let logs = records.map((rc, idx) => {
      // Determine student name from either ref or flat field
      const studentName = (rc.student && rc.student.name) ? rc.student.name : (rc.name || "Unknown Student");
      const studentEmail = (rc.student && rc.student.email) ? rc.student.email : "";
      
      // Subject / submission info
      const submission = (rc.subject && rc.subject.name) ? rc.subject.name : (rc.course || "General Assessment");
      const program = rc.course || "N/A";

      // Scores
      const aiScore = rc.aiScore !== undefined ? rc.aiScore : 0;
      const plgScore = rc.plagiarism !== undefined ? rc.plagiarism : 0;
      
      // Trust score: use stored value, or derive from consistency score
      let trust = rc.trustScore !== undefined ? rc.trustScore : (rc.consistencyScore || 100);

      // Determine status based on trust score and flags
      let logStatus = "Safe";
      if (trust <= 40 || (rc.flags && rc.flags.length >= 2)) {
        logStatus = "Critical";
      } else if (trust <= 70 || (rc.flags && rc.flags.length === 1)) {
        logStatus = "Review";
      }

      // Generate scan ID
      const scanId = `REV-${String(1000 + idx).slice(-4)}`;

      return {
        id: scanId,
        _id: rc._id,
        student: studentName,
        email: studentEmail,
        program,
        submission,
        semester: rc.semester || null,
        aiScore,
        plgScore,
        trust,
        marks: rc.marks,
        attendance: rc.attendance || 0,
        flags: rc.flags || [],
        consistencyScore: rc.consistencyScore || 100,
        date: rc.createdAt ? new Date(rc.createdAt).toISOString().split("T")[0] : "N/A",
        status: logStatus,
      };
    });

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(log =>
        log.id.toLowerCase().includes(q) ||
        log.student.toLowerCase().includes(q) ||
        log.submission.toLowerCase().includes(q) ||
        log.email.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (status && status !== "All") {
      logs = logs.filter(log => log.status === status);
    }

    // Apply sorting
    if (sortBy === "trust-asc") {
      logs.sort((a, b) => a.trust - b.trust);
    } else if (sortBy === "trust-desc") {
      logs.sort((a, b) => b.trust - a.trust);
    } else if (sortBy === "date-asc") {
      logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    // default is date-desc (already sorted by createdAt: -1)

    // Summary stats
    const summary = {
      total: logs.length,
      critical: logs.filter(l => l.status === "Critical").length,
      review: logs.filter(l => l.status === "Review").length,
      safe: logs.filter(l => l.status === "Safe").length,
      avgTrustScore: logs.length > 0 ? Math.round(logs.reduce((sum, l) => sum + l.trust, 0) / logs.length) : 0,
    };

    res.status(200).json({ logs, summary });
  } catch (error) {
    console.error("Reports fetch error:", error);
    res.status(500).json({ message: "Server error fetching reports" });
  }
};

/**
 * @desc    Get detail for a single scan report
 * @route   GET /api/reports/:id
 * @access  Private/Teacher, Admin
 */
export const getReportDetail = async (req, res) => {
  try {
    const record = await PerformanceRecord.findById(req.params.id)
      .populate("student", "name email")
      .populate("subject", "name code")
      .populate("teacher", "name");

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get group cheating detection results (from Python engine output)
 * @route   GET /api/reports/group-detection
 * @access  Private/Teacher, Admin
 */
export const getGroupDetection = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "cheating_detection", "detection_results.json");
    
    if (!fs.existsSync(filePath)) {
      return res.status(200).json({ summary: { total_groups_flagged: 0 }, flagged_groups: [] });
    }

    const data = fs.readFileSync(filePath, "utf-8");
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    console.error("Group detection fetch error:", error);
    res.status(200).json({ summary: { total_groups_flagged: 0 }, flagged_groups: [] });
  }
};

/**
 * @desc    Run the Python cheating detection engine
 * @route   POST /api/reports/run-group-detection
 * @access  Private/Teacher, Admin
 */
export const runGroupDetection = async (req, res) => {
  try {
    const workingDir = path.join(process.cwd(), "cheating_detection");

    console.log("Starting Python Intelligence Engine...");
    
    exec(`python run.py`, { cwd: workingDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Exec error: ${error}`);
        return res.status(500).json({ message: "Failed to run detection engine" });
      }
      
      console.log("Analysis Complete!");
      
      // After run, read and return updated results
      const filePath = path.join(workingDir, "detection_results.json");
      const data = fs.readFileSync(filePath, "utf-8");
      res.status(200).json(JSON.parse(data));
    });
  } catch (error) {
    console.error("Group detection run error:", error);
    res.status(500).json({ message: "Server error running engine" });
  }
};
