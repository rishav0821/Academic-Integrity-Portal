import express from "express";
import { uploadMarks, getDashboardMetrics } from "../controllers/marksController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("teacher", "admin"), uploadMarks);
router.get("/dashboard", protect, getDashboardMetrics);

export default router;
