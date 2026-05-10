import express from "express";
import {
  getPerformanceAnomalies,
  getGroupCheating,
  getAssessmentQuality,
  getGradingConsistency,
  getFullReport,
} from "../controllers/intelligenceController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
const guard = [protect, authorizeRoles("teacher", "admin", "Admin", "Teacher")];

router.get("/anomalies",            ...guard, getPerformanceAnomalies);
router.get("/group-cheating",       ...guard, getGroupCheating);
router.get("/assessment-quality",   ...guard, getAssessmentQuality);
router.get("/grading-consistency",  ...guard, getGradingConsistency);
router.get("/full-report",          ...guard, getFullReport);

export default router;
