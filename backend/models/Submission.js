import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, default: "" },  // optional text answer
  plagiarismText: { type: String, default: "" }, // extracted text used for plagiarism (from content or PDF)
  // File submitted by student (PDF / image)
  submissionFile: {
    filename: { type: String },
    storedName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
  },
  plagiarismScore: { type: Number, default: 0 },
  similarTo: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      studentName: String,
      similarity: Number,
    }
  ],
  status: {
    type: String,
    enum: ["pending", "checked", "flagged"],
    default: "pending",
  },
  marks: { type: Number, default: null },
}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);
