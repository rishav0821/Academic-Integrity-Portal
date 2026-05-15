import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import { detectPlagiarism, computePlagiarismScore } from "../utils/plagiarismEngine.js";

/**
 * Extract comparable text from a submission:
 * - If text content provided, use that
 * - If PDF uploaded, extract text from it
 * - Otherwise return empty string
 */
async function extractTextForPlagiarism(content, file) {
  // Prefer explicit text answer
  if (content && content.trim().length >= 20) return content.trim();

  // Try to extract text from uploaded PDF
  if (file && file.mimetype === "application/pdf") {
    try {
      const buffer = fs.readFileSync(file.path);
      const data = await pdfParse(buffer);
      const extracted = data.text?.trim() || "";
      if (extracted.length >= 20) return extracted;
    } catch (err) {
      console.error("PDF text extraction failed:", err.message);
    }
  }

  return content?.trim() || "";
}

// ─── TEACHER: Create Assignment ───────────────────────────────────────────────
export const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, dueDate, maxMarks } = req.body;
    const assignmentData = {
      title, description, subject, dueDate,
      maxMarks: maxMarks || 100,
      createdBy: req.user._id,
    };
    if (req.file) {
      assignmentData.attachment = {
        filename: req.file.originalname,
        storedName: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }
    const assignment = await Assignment.create(assignmentData);
    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ALL: Get Assignments ─────────────────────────────────────────────────────
export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ALL: Get Single Assignment ───────────────────────────────────────────────
export const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate("createdBy", "name email");
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ALL: Download/View Teacher's Assignment Attachment ───────────────────────
export const downloadAttachment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment?.attachment?.storedName)
      return res.status(404).json({ message: "No attachment found" });

    const filePath = path.resolve("uploads/assignments", assignment.attachment.storedName);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "File not found on server" });

    res.setHeader("Content-Disposition", `inline; filename="${assignment.attachment.filename}"`);
    res.setHeader("Content-Type", assignment.attachment.mimetype);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── TEACHER: Delete Assignment ───────────────────────────────────────────────
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Not found" });
    if (assignment.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (assignment.attachment?.storedName) {
      const fp = path.resolve("uploads/assignments", assignment.attachment.storedName);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await assignment.deleteOne();
    await Submission.deleteMany({ assignment: req.params.id });
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── STUDENT: Submit Assignment (file + optional text) ────────────────────────
export const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const content = req.body.content || "";

    // Must provide at least a file OR text content
    if (!req.file && content.trim().length < 20) {
      return res.status(400).json({
        message: "Please upload a file or write at least 20 characters of text.",
      });
    }

    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) return res.status(400).json({ message: "You have already submitted this assignment" });

    // Extract the best available text for plagiarism comparison
    const textForPlagiarism = await extractTextForPlagiarism(content, req.file);

    // Run plagiarism check against all existing submissions for this assignment
    let plagiarismScore = 0;
    let significantMatches = [];

    if (textForPlagiarism.length >= 20) {
      const otherSubmissions = await Submission.find({ assignment: assignmentId }).populate("student", "name");

      // Build corpus — use each submission's plagiarismText (extracted) or content
      const corpus = otherSubmissions
        .filter((s) => (s.plagiarismText || s.content || "").trim().length >= 20)
        .map((s) => ({
          studentId: s.student._id,
          studentName: s.student.name,
          content: s.plagiarismText || s.content,
        }));

      if (corpus.length > 0) {
        const similarities = detectPlagiarism(textForPlagiarism, corpus);
        plagiarismScore = computePlagiarismScore(similarities);
        significantMatches = similarities.filter((s) => s.similarity >= 15);
      }
    }

    const status = plagiarismScore >= 70 ? "flagged" : "checked";

    const submissionData = {
      assignment: assignmentId,
      student: req.user._id,
      content,
      plagiarismText: textForPlagiarism,  // stored for future comparisons
      plagiarismScore,
      similarTo: significantMatches,
      status,
    };

    if (req.file) {
      submissionData.submissionFile = {
        filename: req.file.originalname,
        storedName: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }

    const submission = await Submission.create(submissionData);
    res.status(201).json({
      message: "Assignment submitted successfully",
      plagiarismScore,
      status,
      similarTo: significantMatches,
      submission,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── STUDENT: Delete Their Own Submission ────────────────────────────────────
export const deleteMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id,
    });
    if (!submission) return res.status(404).json({ message: "No submission found" });

    // Delete the uploaded file from disk if it exists
    if (submission.submissionFile?.storedName) {
      const filePath = path.resolve("uploads/submissions", submission.submissionFile.storedName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await submission.deleteOne();
    res.json({ message: "Submission deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── STUDENT: View Their Own Submitted File ───────────────────────────────────
export const downloadMySubmissionFile = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id,
    });
    if (!submission?.submissionFile?.storedName)
      return res.status(404).json({ message: "No file found for your submission" });

    const filePath = path.resolve("uploads/submissions", submission.submissionFile.storedName);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "File not found on server" });

    res.setHeader("Content-Disposition", `inline; filename="${submission.submissionFile.filename}"`);
    res.setHeader("Content-Type", submission.submissionFile.mimetype);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── TEACHER: View Student's Submitted File ───────────────────────────────────
export const downloadSubmissionFile = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission?.submissionFile?.storedName)
      return res.status(404).json({ message: "No file found for this submission" });

    const filePath = path.resolve("uploads/submissions", submission.submissionFile.storedName);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "File not found on server" });

    res.setHeader("Content-Disposition", `inline; filename="${submission.submissionFile.filename}"`);
    res.setHeader("Content-Type", submission.submissionFile.mimetype);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── TEACHER: Get All Submissions for an Assignment ───────────────────────────
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate("student", "name email studentId")
      .sort({ plagiarismScore: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── STUDENT: Get My Submission ───────────────────────────────────────────────
export const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
    res.json(submission || null);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── TEACHER: Grade a Submission ─────────────────────────────────────────────
export const gradeSubmission = async (req, res) => {
  try {
    const { marks } = req.body;
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    submission.marks = marks;
    await submission.save();
    res.json({ message: "Marks updated", submission });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── TEACHER: Re-run plagiarism check on all submissions for an assignment ────
export const recheckPlagiarism = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const submissions = await Submission.find({ assignment: assignmentId }).populate("student", "name");

    if (submissions.length < 2) {
      return res.json({ message: "Need at least 2 submissions to compare", updated: 0 });
    }

    // Build full corpus of extracted texts
    const corpus = [];
    for (const sub of submissions) {
      let text = sub.plagiarismText || sub.content || "";

      // If no text yet but has a PDF, try to extract now
      if (text.trim().length < 20 && sub.submissionFile?.storedName && sub.submissionFile?.mimetype === "application/pdf") {
        try {
          const filePath = path.resolve("uploads/submissions", sub.submissionFile.storedName);
          if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            const data = await pdfParse(buffer);
            text = data.text?.trim() || "";
          }
        } catch (e) {
          console.error("PDF re-extract failed:", e.message);
        }
      }

      corpus.push({ submissionId: sub._id, studentId: sub.student._id, studentName: sub.student.name, text });
    }

    // Re-score each submission against all others
    let updated = 0;
    for (const item of corpus) {
      if (item.text.trim().length < 20) continue;

      const others = corpus.filter((c) => c.submissionId.toString() !== item.submissionId.toString() && c.text.trim().length >= 20);
      if (others.length === 0) continue;

      const similarities = detectPlagiarism(item.text, others.map((o) => ({
        studentId: o.studentId,
        studentName: o.studentName,
        content: o.text,
      })));

      const plagiarismScore = computePlagiarismScore(similarities);
      const significantMatches = similarities.filter((s) => s.similarity >= 15);
      const status = plagiarismScore >= 70 ? "flagged" : "checked";

      await Submission.findByIdAndUpdate(item.submissionId, {
        plagiarismText: item.text,
        plagiarismScore,
        similarTo: significantMatches,
        status,
      });
      updated++;
    }

    res.json({ message: `Plagiarism re-check complete. Updated ${updated} submissions.`, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
