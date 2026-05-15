import express from "express";
import { getAttendanceSummary, getAttendanceDetail, getGradingConsistency, getStudentsOverview } from "../controllers/analyticsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/attendance", protect, getAttendanceSummary);
router.get("/attendance-detail", protect, getAttendanceDetail);
router.get("/grading-consistency", protect, authorizeRoles("teacher", "admin"), getGradingConsistency);
router.get("/students-overview", protect, authorizeRoles("teacher", "admin"), getStudentsOverview);

export default router;
