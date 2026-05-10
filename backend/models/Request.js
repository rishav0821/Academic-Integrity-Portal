import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "marks_revaluation",
      "integrity_flag_dispute",
      "plagiarism_review",
      "grade_appeal",
      "attendance_correction",
      "ai_score_dispute",
      "other"
    ],
    required: true
  },
  subject: { type: String, required: true },
  semester: { type: String, default: "" },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "under_review", "resolved", "rejected"],
    default: "pending"
  },
  teacherResponse: { type: String, default: "" },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  respondedAt: { type: Date }
}, { timestamps: true });

const Request = mongoose.model("Request", requestSchema);
export default Request;
