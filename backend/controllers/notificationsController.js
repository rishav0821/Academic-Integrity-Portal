import Assignment from "../models/Assignment.js";
import PerformanceRecord from "../models/PerformanceRecord.js";
import User from "../models/User.js";

// @desc    Get dynamic notifications for the user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    const notifications = [];

    // Common logic: fetch assignments from last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    if (role === "student") {
      // 1. Assignment Notifications
      const recentAssignments = await Assignment.find({
        createdAt: { $gte: oneWeekAgo }
      }).sort({ createdAt: -1 });

      recentAssignments.forEach(assignment => {
        notifications.push({
          id: `assignment-${assignment._id}`,
          title: "New Assignment Published",
          message: `The assignment "${assignment.title}" in ${assignment.subject} has been published.`,
          type: "info",
          date: assignment.createdAt
        });
      });

      // 2. Performance Warning Notification
      // Calculate attendance and performance simply for current student
      const records = await PerformanceRecord.find({ student: req.user._id });
      if (records.length > 0) {
        let totalAttendance = 0;
        let totalMarks = 0;
        records.forEach(rc => {
          totalAttendance += (rc.attendance || 0);
          totalMarks += (rc.marks || 0);
        });
        
        const avgAttendance = Math.round(totalAttendance / records.length);
        const avgMarks = Math.round(totalMarks / records.length);
        
        if (avgAttendance < 75) {
          notifications.push({
            id: `perf-att`,
            title: "Performance Warning",
            message: `Your overall attendance has dropped below 75% (${avgAttendance}%).`,
            type: "warning",
            date: new Date() // Generate dynamic date as of right now
          });
        }
        if (avgMarks < 60) {
          notifications.push({
            id: `perf-marks`,
            title: "Performance Decline",
            message: `Your average academic score is critically low (${avgMarks}%). Please review your subjects.`,
            type: "danger",
            date: new Date()
          });
        }
      }
    } else if (role === "teacher" || role === "admin") {
      // 1. Assignment Notifications (Assignments created by them)
      const teacherAssignments = await Assignment.find({
        createdBy: req.user._id,
        createdAt: { $gte: oneWeekAgo }
      }).sort({ createdAt: -1 });

      teacherAssignments.forEach(assignment => {
        notifications.push({
          id: `teacher-assignment-${assignment._id}`,
          title: "Assignment Published",
          message: `You successfully published the assignment "${assignment.title}".`,
          type: "success",
          date: assignment.createdAt
        });
      });

      // 2. Performance At-Risk Alerts
      // We will identify at risk students (e.g. low trust score)
      const records = await PerformanceRecord.find({ trustScore: { $lte: 70 } })
        .populate("student", "name email");
      
      const atRiskStudentsCount = new Set(
        records
          .filter(r => r.student && r.student._id)
          .map(r => r.student._id.toString())
      ).size;

      if (atRiskStudentsCount > 0) {
        notifications.push({
          id: "teacher-at-risk",
          title: "Action Required",
          message: `There are ${atRiskStudentsCount} student(s) identified as "At Risk" requiring your attention.`,
          type: "warning",
          date: new Date()
        });
      }
    }

    // Sort all notifications by date descending
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Notifications error:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};
