import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  // Support both ObjectIds (legacy) and JSON flat structure
  student: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
  subject: { type: mongoose.Schema.Types.Mixed, ref: 'Subject' },
  teacher: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
  
  semester: { type: Number },
  marks: { type: Number, required: true, min: 0 },
  attendance: { type: Number, default: 0, min: 0 },
  assignments: { type: Number, default: 0, min: 0, max: 100 },
  consistencyScore: { type: Number, default: 100 },
  flags: [{ type: String }],

  // Advanced Matrix parsed from JSON
  studentId: { type: String },
  name: { type: String },
  course: { type: String },
  section: { type: String },
  aiScore: { type: Number },
  plagiarism: { type: Number },
  trustScore: { type: Number }
}, { timestamps: true, strict: false });

export default mongoose.models.PerformanceRecord || mongoose.model("PerformanceRecord", performanceSchema);
