/**
 * Full Demo Seed Script
 * Creates 15 students + 2 teachers + 1 admin with realistic 12-month performance data
 * Credentials: firstname@gmail.com / 12345678
 *
 * Run: node scripts/seedFullDemo.js
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
console.log("✅ MongoDB Connected\n");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v, min, max) => Math.max(min, Math.min(max, Math.round(v)));
const noise = () => (Math.random() - 0.5) * 8;

function monthToDate(idx) {
  const d = new Date("2025-05-01");
  d.setMonth(d.getMonth() + idx);
  return d;
}

const MONTHS = [
  "May 2025","Jun 2025","Jul 2025","Aug 2025",
  "Sep 2025","Oct 2025","Nov 2025","Dec 2025",
  "Jan 2026","Feb 2026","Mar 2026","Apr 2026",
];

function generateMonthData(trendType, baseMarks) {
  const months = [];
  let cur = clamp(baseMarks, 35, 90);
  for (let i = 0; i < 12; i++) {
    switch (trendType) {
      case "improving":     cur += 2.5 + noise(); break;
      case "declining":     cur -= 2.2 + noise(); break;
      case "volatile":      cur += (Math.random() > 0.5 ? 1 : -1) * (9 + Math.random() * 10); break;
      case "stable":        cur += noise() * 0.4; break;
      case "late_recovery": cur += i < 6 ? -3 + noise() : 4.5 + noise(); break;
      case "early_drop":    cur += i < 4 ? -5 + noise() : 1.5 + noise(); break;
      default:              cur += noise();
    }
    const marks       = clamp(cur, 28, 100);
    const attendance  = clamp(marks * 0.85 + noise() * 6, 38, 100);
    const assignments = clamp(marks + 6 + noise() * 3, 30, 100);
    const aiScore     = clamp(100 - marks + noise() * 12, 0, 95);
    const plagiarism  = clamp((100 - assignments) * 0.28 + Math.random() * 12, 0, 65);
    const trustScore  = clamp(marks * 0.4 + attendance * 0.3 + assignments * 0.2 - aiScore * 0.1, 18, 100);
    months.push({ marks, attendance, assignments, aiScore, plagiarism, trustScore });
  }
  return months;
}

// ─── Subjects ─────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { name: "Mathematics",        code: "MATH101" },
  { name: "Data Structures",    code: "DS201"   },
  { name: "Machine Learning",   code: "ML301"   },
  { name: "Operating Systems",  code: "OS202"   },
  { name: "Computer Networks",  code: "CN203"   },
  { name: "Database Systems",   code: "DB204"   },
];

// ─── Users ────────────────────────────────────────────────────────────────────
// email = firstname.toLowerCase()@gmail.com  |  password = 12345678
const DEMO_USERS = [
  // ── Students (15) ──
  { name: "Aarav Sharma",    role: "student", department: "B.Tech CSE", trend: "improving",     base: 52 },
  { name: "Priya Verma",     role: "student", department: "B.Tech CSE", trend: "stable",        base: 78 },
  { name: "Rohan Gupta",     role: "student", department: "MCA",        trend: "declining",     base: 85 },
  { name: "Sneha Patel",     role: "student", department: "B.Tech IT",  trend: "volatile",      base: 65 },
  { name: "Karan Mehta",     role: "student", department: "MCA",        trend: "late_recovery", base: 60 },
  { name: "Ananya Singh",    role: "student", department: "B.Tech CSE", trend: "improving",     base: 48 },
  { name: "Vikram Yadav",    role: "student", department: "B.Tech IT",  trend: "early_drop",    base: 80 },
  { name: "Pooja Joshi",     role: "student", department: "B.Tech CSE", trend: "stable",        base: 72 },
  { name: "Arjun Nair",      role: "student", department: "MCA",        trend: "declining",     base: 88 },
  { name: "Divya Reddy",     role: "student", department: "B.Tech IT",  trend: "volatile",      base: 58 },
  { name: "Rahul Tiwari",    role: "student", department: "B.Tech CSE", trend: "improving",     base: 44 },
  { name: "Meera Iyer",      role: "student", department: "MCA",        trend: "stable",        base: 82 },
  { name: "Siddharth Das",   role: "student", department: "B.Tech IT",  trend: "late_recovery", base: 55 },
  { name: "Kavya Pillai",    role: "student", department: "B.Tech CSE", trend: "declining",     base: 76 },
  { name: "Nikhil Bose",     role: "student", department: "MCA",        trend: "volatile",      base: 68 },
  // ── Teachers (2) ──
  { name: "Aditya Raj",      role: "teacher",  department: "Computer Science" },
  { name: "Sunita Kapoor",   role: "teacher",  department: "Information Technology" },
  // ── Admin (1) ──
  { name: "Admin Portal",    role: "admin",    department: "Administration" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
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

  // 2. Create / update users
  const createdUsers = [];
  for (const u of DEMO_USERS) {
    const firstName = u.name.split(" ")[0].toLowerCase();
    const email     = `${firstName}@gmail.com`;
    const password  = "12345678";

    let user = await User.findOne({ email });
    if (user) {
      // Update existing — reset password & department
      user.name       = u.name;
      user.role       = u.role;
      user.department = u.department || "";
      user.password   = password;   // pre-save hook will re-hash
      await user.save();
      console.log(`  ♻️  Updated  : ${u.name} <${email}> [${u.role}]`);
    } else {
      user = await User.create({
        name:       u.name,
        email,
        password,
        role:       u.role,
        department: u.department || "",
      });
      console.log(`  ✅ Created  : ${u.name} <${email}> [${u.role}]`);
    }
    createdUsers.push({ user, meta: u });
  }

  // 3. Seed performance records for students only
  const students = createdUsers.filter(u => u.meta.role === "student");
  const studentIds = students.map(s => s.user._id);

  await PerformanceRecord.deleteMany({ student: { $in: studentIds } });
  console.log(`\n🗑️  Cleared old performance records for ${students.length} students`);

  let totalRecords = 0;
  for (const { user, meta } of students) {
    for (const subjectDoc of subjectDocs) {
      const subjectBase = meta.base + (Math.random() - 0.5) * 16;
      const monthlyData = generateMonthData(meta.trend, subjectBase);

      const records = monthlyData.map((d, idx) => ({
        student:        user._id,
        subject:        subjectDoc._id,
        semester:       Math.floor(idx / 3) + 1,
        month:          MONTHS[idx],
        monthIndex:     idx,
        marks:          d.marks,
        attendance:     d.attendance,
        assignments:    d.assignments,
        aiScore:        d.aiScore,
        plagiarism:     d.plagiarism,
        trustScore:     d.trustScore,
        consistencyScore: d.trustScore,
        flags:          [],
        createdAt:      monthToDate(idx),
      }));

      await PerformanceRecord.insertMany(records);
      totalRecords += records.length;
    }
    console.log(`  📊 ${user.name.padEnd(20)} trend: ${meta.trend.padEnd(14)} dept: ${meta.department}`);
  }

  // 4. Print credentials summary
  console.log("\n" + "═".repeat(62));
  console.log("  DEMO CREDENTIALS  (password for all: 12345678)");
  console.log("═".repeat(62));
  console.log("  ROLE      NAME                  EMAIL");
  console.log("─".repeat(62));
  for (const u of DEMO_USERS) {
    const email = `${u.name.split(" ")[0].toLowerCase()}@gmail.com`;
    console.log(`  ${u.role.padEnd(9)} ${u.name.padEnd(22)} ${email}`);
  }
  console.log("═".repeat(62));
  console.log(`\n🎉 Done! ${totalRecords} performance records created for ${students.length} students.\n`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
