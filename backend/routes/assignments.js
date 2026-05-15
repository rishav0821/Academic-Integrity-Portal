import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadAssignment, uploadSubmission } from "../middleware/upload.js";
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
  downloadAttachment,
  submitAssignment,
  downloadSubmissionFile,
  downloadMySubmissionFile,
  deleteMySubmission,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  recheckPlagiarism,
} from "../controllers/assignmentController.js";

const router = express.Router();
router.use(protect);

// Teacher creates assignment with optional PDF
router.post("/", authorizeRoles("teacher", "admin"), uploadAssignment.single("attachment"), createAssignment);

// Get all / single assignment
router.get("/", getAssignments);
router.get("/:id", getAssignment);

// Download teacher's assignment PDF
router.get("/:id/attachment", downloadAttachment);

// Teacher deletes assignment
router.delete("/:id", authorizeRoles("teacher", "admin"), deleteAssignment);

// Student submits — accepts optional file field "submissionFile"
router.post("/:id/submit", authorizeRoles("student"), uploadSubmission.single("submissionFile"), submitAssignment);

// Teacher views all submissions
router.get("/:id/submissions", authorizeRoles("teacher", "admin"), getSubmissions);

// Teacher re-runs plagiarism check on all submissions
router.post("/:id/recheck-plagiarism", authorizeRoles("teacher", "admin"), recheckPlagiarism);

// Teacher downloads a student's submitted file
router.get("/:id/submissions/:submissionId/file", authorizeRoles("teacher", "admin"), downloadSubmissionFile);

// Student views their own submission
router.get("/:id/my-submission", authorizeRoles("student"), getMySubmission);

// Student views their own submitted file
router.get("/:id/my-submission/file", authorizeRoles("student"), downloadMySubmissionFile);

// Student deletes their own submission
router.delete("/:id/my-submission", authorizeRoles("student"), deleteMySubmission);

// Teacher grades a submission
router.put("/:id/submissions/:submissionId/grade", authorizeRoles("teacher", "admin"), gradeSubmission);

export default router;
