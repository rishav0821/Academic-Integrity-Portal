import express from "express";
import { getAttendanceSummary, getGradingConsistency } from "../controllers/analyticsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/attendance", protect, getAttendanceSummary);
router.get("/grading-consistency", protect, authorizeRoles("teacher", "admin"), getGradingConsistency);

export default router;
