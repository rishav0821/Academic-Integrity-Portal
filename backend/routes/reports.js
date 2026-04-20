import express from "express";
import { getReportLogs, getReportDetail, getGroupDetection, runGroupDetection } from "../controllers/reportsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getReportLogs);
router.get("/group-detection", protect, getGroupDetection);
router.post("/run-group-detection", protect, authorizeRoles("Teacher", "Admin"), runGroupDetection);
router.get("/:id", protect, getReportDetail);

export default router;
