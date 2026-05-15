import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Subject from "../models/Subject.js";

// @desc    Get all subjects for attendance marking dropdown
// @route   GET /api/attendance/subjects
// @access  Private/Teacher/Admin
export const getSubjectsForAttendance = async (req, res) => {
  try {
    const subjects = await Subject.find({}).select("name code");
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching subjects" });
  }
};

// @desc    Get all students for attendance marking
// @route   GET /api/attendance/students
// @access  Private/Teacher/Admin
export const getStudentsForAttendance = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name email studentId role");
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching students" });
  }
};

// @desc    Get attendance for a specific date and subject
// @route   GET /api/attendance?date=YYYY-MM-DD&subjectId=XYZ
// @access  Private/Teacher/Admin
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date, subjectId } = req.query;
    if (!date || !subjectId) {
      return res.status(400).json({ message: "Date and Subject ID are required" });
    }
    
    const records = await Attendance.find({ date, subject: subjectId }).populate("student", "name email studentId");
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching attendance" });
  }
};

// @desc    Save/Upsert bulk attendance for a date and subject
// @route   POST /api/attendance
// @access  Private/Teacher/Admin
export const saveAttendance = async (req, res) => {
  try {
    const { date, subjectId, attendances } = req.body;
    
    if (!date || !subjectId || !attendances || !Array.isArray(attendances)) {
      return res.status(400).json({ message: "Date, Subject ID, and attendances array are required" });
    }

    // Bulk upsert using bulkWrite
    const bulkOps = attendances.map((att) => ({
      updateOne: {
        filter: { student: att.studentId, date: date, subject: subjectId },
        update: {
          $set: {
            student: att.studentId,
            subject: subjectId,
            date: date,
            status: att.status,
            markedBy: req.user._id,
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    res.json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saving attendance" });
  }
};
