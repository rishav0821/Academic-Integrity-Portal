import express from "express";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all students for the dropdown
router.get("/students", protect, authorizeRoles("teacher", "admin"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server Error fetching students" });
  }
});

// Get all subjects
router.get("/subjects", protect, authorizeRoles("teacher", "admin"), async (req, res) => {
  try {
    // If empty, seed some default subjects to make life easier
    let subjects = await Subject.find();
    if (subjects.length === 0) {
      const inserted = await Subject.insertMany([
        { name: "Mathematics Data Science", code: "MAT101" },
        { name: "Advanced Statistics", code: "STAT201" },
        { name: "Machine Learning Concepts", code: "ML301" }
      ]);
      subjects = inserted;
    }
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error fetching subjects" });
  }
});

export default router;
