import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getSubjectsForAttendance,
  getStudentsForAttendance,
  getAttendanceByDate,
  saveAttendance
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/subjects", protect, authorizeRoles("teacher", "admin"), getSubjectsForAttendance);
router.get("/students", protect, authorizeRoles("teacher", "admin"), getStudentsForAttendance);
router.get("/", protect, authorizeRoles("teacher", "admin"), getAttendanceByDate);
router.post("/", protect, authorizeRoles("teacher", "admin"), saveAttendance);

export default router;
