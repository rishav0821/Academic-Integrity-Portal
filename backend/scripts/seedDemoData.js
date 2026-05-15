/**
 * Demo Data Seed Script
 * Creates 12-month performance history for all student accounts
 * Run: node scripts/seedDemoData.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import User from "../models/User.js";
import Subject from "../models/Subject.js";
import PerformanceRecord from "../models/PerformanceRecord.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB Connected");

// ─── Subjects ─────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { name: "Mathematics", code: "MATH101" },
  { name: "Data Structures", code: "DS201" },
  { name: "Machine Learning", code: "ML301" },
  { name: "Operating Systems", code: "OS202" },
  { name: "Computer Networks", code: "CN203" },
];

// ─── 12 months labels (May 2025 → April 2026) ────────────────────────────────
const MONTHS = [
  "May 2025", "Jun 2025", "Jul 2025", "Aug 2025",
  "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
  "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026",
];

// Month index → approximate Date
function monthToDate(idx) {
  const base = new Date("2025-05-01");
  base.setMonth(base.getMonth() + idx);
  return base;
}

// Clamp helper
const clamp = (v, min, max) => Math.max(min, Math.min(max, Math.round(v)));

/**
 * Generate a realistic trend for one student over 12 months
 * trendType: "improving" | "declining" | "volatile" | "stable" | "late_recovery"
 */
function generateTrend(trendType, base, subject) {
  const months = [];
  let current = base;

  for (let i = 0; i < 12; i++) {
    const noise = () => (Math.random() - 0.5) * 8;

    switch (trendType) {
      case "improving":
        current += 2.5 + noise();
        break;
      case "declining":
        current -= 2.2 + noise();
        break;
      case "volatile":
        current += (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 10);
        break;
      case "stable":
        current += noise() * 0.5;
        break;
      case "late_recovery":
        // drops first 6 months, then recovers
        current += i < 6 ? -3 + noise() : 4 + noise();
        break;
      default:
        current += noise();
    }

    const marks = clamp(current, 30, 100);
    // Attendance loosely correlated with marks
    const attendance = clamp(marks * 0.85 + noise() * 5, 40, 100);
    // Assignments slightly easier than exam
    const assignments = clamp(marks + 5 + noise() * 3, 30, 100);
    // AI score inversely correlated with performance (struggling students use AI more)
    const aiScore = clamp(100 - marks + noise() * 10, 0, 95);
    // Plagiarism random but higher when assignments are low
    const plagiarism = clamp((100 - assignments) * 0.3 + Math.random() * 10, 0, 60);
    // Trust score composite
    const trustScore = clamp((marks * 0.4 + attendance * 0.3 + assignments * 0.2 - aiScore * 0.1), 20, 100);

    months.push({ marks, attendance, assignments, aiScore, plagiarism, trustScore });
  }
  return months;
}

// ─── Student profiles ─────────────────────────────────────────────────────────
const STUDENT_PROFILES = [
  { trend: "improving",     baseMarks: 52, description: "Consistently improving student" },
  { trend: "declining",     baseMarks: 82, description: "High performer but declining" },
  { trend: "volatile",      baseMarks: 65, description: "Inconsistent performance" },
  { trend: "stable",        baseMarks: 75, description: "Steady average performer" },
  { trend: "late_recovery", baseMarks: 70, description: "Struggled then recovered" },
];

// ─── Main seed ────────────────────────────────────────────────────────────────
async function seed() {
  // 1. Upsert subjects
  const subjectDocs = [];
  for (const s of SUBJECTS) {
    const doc = await Subject.findOneAndUpdate(
      { code: s.code },
      { name: s.name, code: s.code },
      { upsert: true, new: true }
    );
    subjectDocs.push(doc);
  }
  console.log(`✅ ${subjectDocs.length} subjects ready`);

  // 2. Get all student accounts
  const students = await User.find({ role: "student" });
  if (!students.length) {
    console.log("❌ No student accounts found. Please register at least one student first.");
    process.exit(1);
  }
  console.log(`✅ Found ${students.length} student(s)`);

  // 3. Delete old performance records for these students
  const studentIds = students.map((s) => s._id);
  await PerformanceRecord.deleteMany({ student: { $in: studentIds } });
  console.log("🗑️  Cleared old records");

  // 4. Create 12-month records per student per subject
  let totalCreated = 0;

  for (let si = 0; si < students.length; si++) {
    const student = students[si];
    const profile = STUDENT_PROFILES[si % STUDENT_PROFILES.length];

    for (const subjectDoc of subjectDocs) {
      // Each subject gets slightly different base marks (±10)
      const subjectBase = profile.baseMarks + (Math.random() - 0.5) * 20;
      const monthlyData = generateTrend(profile.trend, subjectBase, subjectDoc.name);

      const records = monthlyData.map((d, idx) => ({
        student: student._id,
        subject: subjectDoc._id,
        semester: Math.floor(idx / 3) + 1,   // 3 months per semester → 4 semesters
        month: MONTHS[idx],
        monthIndex: idx,
        marks: d.marks,
        attendance: d.attendance,
        assignments: d.assignments,
        aiScore: d.aiScore,
        plagiarism: d.plagiarism,
        trustScore: d.trustScore,
        consistencyScore: d.trustScore,
        flags: [],
        createdAt: monthToDate(idx),
      }));

      await PerformanceRecord.insertMany(records);
      totalCreated += records.length;
    }

    console.log(`  ✅ ${student.name} (${profile.trend}) — ${subjectDocs.length * 12} records`);
  }

  console.log(`\n🎉 Done! Created ${totalCreated} performance records for ${students.length} students.`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
