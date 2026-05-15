import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  maxMarks: { type: Number, default: 100 },
  // PDF attachment uploaded by teacher
  attachment: {
    filename: { type: String },      // original file name shown to students
    storedName: { type: String },    // name on disk
    mimetype: { type: String },
    size: { type: Number },
  },
}, { timestamps: true });

export default mongoose.model("Assignment", assignmentSchema);
