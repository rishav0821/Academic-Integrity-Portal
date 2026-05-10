import mongoose from "mongoose";
import dotenv from "dotenv";
import PerformanceRecord from "./models/PerformanceRecord.js";
import Subject from "./models/Subject.js";
import User from "./models/User.js";

dotenv.config();

const reseed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    await PerformanceRecord.deleteMany({});
    console.log("🗑  Cleared PerformanceRecord collection.");

    // ── Subjects ──────────────────────────────────────────
    const subNames = [
      "Machine Learning",
      "Operating Systems",
      "Data Structures",
      "Neural Networks",
      "Networking",
      "Advanced Statistics",
      "Software Engineering",
      "Database Management",
    ];
    const subMap = {};
    for (let i = 0; i < subNames.length; i++) {
      const name = subNames[i];
      let sub = await Subject.findOne({ name });
      if (!sub) sub = await Subject.create({ name, code: name.substring(0, 4).toUpperCase().replace(/\s/g,"") + (100 + i) });
      subMap[name] = sub._id;
    }
    console.log("📚 Subjects ready.");

    // ── Teachers (for grading consistency) ────────────────
    let teacherA = await User.findOne({ email: "teacher.a@portal.com" });
    if (!teacherA) teacherA = await User.create({ name: "Dr. Anita Sharma", email: "teacher.a@portal.com", password: "password123", role: "teacher" });

    let teacherB = await User.findOne({ email: "teacher.b@portal.com" });
    if (!teacherB) teacherB = await User.create({ name: "Prof. Rajesh Kumar", email: "teacher.b@portal.com", password: "password123", role: "teacher" });

    let teacherC = await User.findOne({ email: "teacher.c@portal.com" });
    if (!teacherC) teacherC = await User.create({ name: "Dr. Priya Mehta", email: "teacher.c@portal.com", password: "password123", role: "teacher" });

    console.log("👩‍🏫 Teachers ready.");

    // ════════════════════════════════════════════════════════
    //  DATA — designed to trigger all 5 intelligence modules
    // ════════════════════════════════════════════════════════
    const DATA = [

      // ── Feature 1: PERFORMANCE ANOMALY DETECTION ─────────
      // Machine Learning — Suspicious spike in Sem 3 (52→85)
      { studentId: "STU001", name: "Rishav Kumar",   course: "MCA", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 78, marks: 50, aiScore: 20, plagiarism: 5,  trustScore: 75, teacher: teacherA._id },
      { studentId: "STU002", name: "Aman Singh",     course: "MCA", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 82, marks: 53, aiScore: 15, plagiarism: 3,  trustScore: 80, teacher: teacherA._id },
      { studentId: "STU003", name: "Priya Sharma",   course: "MCA", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 70, marks: 54, aiScore: 25, plagiarism: 8,  trustScore: 70, teacher: teacherA._id },
      { studentId: "STU004", name: "Neha Verma",     course: "MCA", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 75, marks: 51, aiScore: 18, plagiarism: 4,  trustScore: 72, teacher: teacherA._id },
      { studentId: "STU005", name: "Rohan Das",      course: "MCA", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 80, marks: 52, aiScore: 10, plagiarism: 2,  trustScore: 78, teacher: teacherA._id },

      // Sem 2 — moderate
      { studentId: "STU001", name: "Rishav Kumar",   course: "MCA", semester: 2, subject: subMap["Machine Learning"], section: "A", attendance: 80, marks: 60, aiScore: 22, plagiarism: 5,  trustScore: 74, teacher: teacherA._id },
      { studentId: "STU002", name: "Aman Singh",     course: "MCA", semester: 2, subject: subMap["Machine Learning"], section: "A", attendance: 84, marks: 58, aiScore: 14, plagiarism: 3,  trustScore: 80, teacher: teacherA._id },
      { studentId: "STU003", name: "Priya Sharma",   course: "MCA", semester: 2, subject: subMap["Machine Learning"], section: "A", attendance: 72, marks: 62, aiScore: 20, plagiarism: 6,  trustScore: 71, teacher: teacherA._id },
      { studentId: "STU004", name: "Neha Verma",     course: "MCA", semester: 2, subject: subMap["Machine Learning"], section: "A", attendance: 76, marks: 57, aiScore: 19, plagiarism: 4,  trustScore: 73, teacher: teacherA._id },
      { studentId: "STU005", name: "Rohan Das",      course: "MCA", semester: 2, subject: subMap["Machine Learning"], section: "A", attendance: 82, marks: 63, aiScore: 11, plagiarism: 2,  trustScore: 79, teacher: teacherA._id },

      // Sem 3 — HUGE SPIKE (anomaly trigger!)
      { studentId: "STU001", name: "Rishav Kumar",   course: "MCA", semester: 3, subject: subMap["Machine Learning"], section: "A", attendance: 90, marks: 88, aiScore: 85, plagiarism: 78, trustScore: 20, teacher: teacherA._id, flags: ["Sudden score spike", "High AI usage"] },
      { studentId: "STU002", name: "Aman Singh",     course: "MCA", semester: 3, subject: subMap["Machine Learning"], section: "A", attendance: 91, marks: 86, aiScore: 88, plagiarism: 80, trustScore: 18, teacher: teacherA._id, flags: ["Sudden score spike"] },
      { studentId: "STU003", name: "Priya Sharma",   course: "MCA", semester: 3, subject: subMap["Machine Learning"], section: "A", attendance: 88, marks: 85, aiScore: 82, plagiarism: 75, trustScore: 22, teacher: teacherA._id, flags: ["Sudden score spike"] },
      { studentId: "STU004", name: "Neha Verma",     course: "MCA", semester: 3, subject: subMap["Machine Learning"], section: "A", attendance: 89, marks: 87, aiScore: 90, plagiarism: 85, trustScore: 15, teacher: teacherA._id, flags: ["Sudden score spike", "High plagiarism"] },
      { studentId: "STU005", name: "Rohan Das",      course: "MCA", semester: 3, subject: subMap["Machine Learning"], section: "A", attendance: 86, marks: 84, aiScore: 80, plagiarism: 72, trustScore: 25, teacher: teacherA._id, flags: ["Sudden score spike"] },

      // ── Feature 2: GROUP CHEATING DETECTION ──────────────
      // Operating Systems — 5 students with identical marks (47) in Sem 2
      { studentId: "STU101", name: "Arjun Mehta",    course: "BTech CS", semester: 2, subject: subMap["Operating Systems"], section: "A", attendance: 70, marks: 47, aiScore: 5,  plagiarism: 10, trustScore: 55, teacher: teacherB._id },
      { studentId: "STU102", name: "Sneha Roy",      course: "BTech CS", semester: 2, subject: subMap["Operating Systems"], section: "A", attendance: 72, marks: 47, aiScore: 6,  plagiarism: 8,  trustScore: 52, teacher: teacherB._id, flags: ["Identical marks cluster"] },
      { studentId: "STU103", name: "Vikram Singh",   course: "BTech CS", semester: 2, subject: subMap["Operating Systems"], section: "A", attendance: 68, marks: 47, aiScore: 4,  plagiarism: 9,  trustScore: 50, teacher: teacherB._id, flags: ["Identical marks cluster"] },
      { studentId: "STU104", name: "Pooja Nair",     course: "BTech CS", semester: 2, subject: subMap["Operating Systems"], section: "A", attendance: 65, marks: 47, aiScore: 7,  plagiarism: 12, trustScore: 48, teacher: teacherB._id, flags: ["Identical marks cluster"] },
      { studentId: "STU105", name: "Karan Malhotra", course: "BTech CS", semester: 2, subject: subMap["Operating Systems"], section: "A", attendance: 71, marks: 47, aiScore: 5,  plagiarism: 11, trustScore: 51, teacher: teacherB._id, flags: ["Identical marks cluster"] },

      // Data Structures — 4 students with identical marks (31) — clear cheating
      { studentId: "STU111", name: "Riya Kapoor",    course: "BTech IT", semester: 1, subject: subMap["Data Structures"], section: "B", attendance: 60, marks: 31, aiScore: 2,  plagiarism: 70, trustScore: 30, teacher: teacherB._id, flags: ["Identical marks cluster", "High plagiarism"] },
      { studentId: "STU112", name: "Siddharth Rao",  course: "BTech IT", semester: 1, subject: subMap["Data Structures"], section: "B", attendance: 62, marks: 31, aiScore: 3,  plagiarism: 72, trustScore: 28, teacher: teacherB._id, flags: ["Identical marks cluster", "High plagiarism"] },
      { studentId: "STU113", name: "Ananya Singh",   course: "BTech IT", semester: 1, subject: subMap["Data Structures"], section: "B", attendance: 58, marks: 31, aiScore: 1,  plagiarism: 68, trustScore: 32, teacher: teacherB._id, flags: ["Identical marks cluster"] },
      { studentId: "STU114", name: "Dev Patel",      course: "BTech IT", semester: 1, subject: subMap["Data Structures"], section: "B", attendance: 64, marks: 31, aiScore: 4,  plagiarism: 71, trustScore: 29, teacher: teacherB._id, flags: ["Identical marks cluster"] },

      // ── Feature 3: ASSESSMENT DESIGN ANALYSIS ────────────
      // Neural Networks — Uniformly very high (too easy / predictable)
      { studentId: "STU201", name: "Priya Gupta",    course: "MCA", semester: 1, subject: subMap["Neural Networks"], section: "A", attendance: 88, marks: 92, aiScore: 5, plagiarism: 2,  trustScore: 95, teacher: teacherA._id },
      { studentId: "STU202", name: "Rahul Sharma",   course: "MCA", semester: 1, subject: subMap["Neural Networks"], section: "A", attendance: 90, marks: 91, aiScore: 4, plagiarism: 1,  trustScore: 96, teacher: teacherA._id },
      { studentId: "STU203", name: "Anjali Verma",   course: "MCA", semester: 1, subject: subMap["Neural Networks"], section: "A", attendance: 85, marks: 93, aiScore: 6, plagiarism: 3,  trustScore: 94, teacher: teacherA._id },
      { studentId: "STU204", name: "Zoya Khan",      course: "MCA", semester: 1, subject: subMap["Neural Networks"], section: "A", attendance: 92, marks: 94, aiScore: 3, plagiarism: 1,  trustScore: 97, teacher: teacherA._id },
      { studentId: "STU205", name: "Harsh Agarwal",  course: "MCA", semester: 1, subject: subMap["Neural Networks"], section: "A", attendance: 87, marks: 92, aiScore: 5, plagiarism: 2,  trustScore: 95, teacher: teacherA._id },
      { studentId: "STU206", name: "Nisha Singh",    course: "MCA", semester: 1, subject: subMap["Neural Networks"], section: "A", attendance: 89, marks: 93, aiScore: 4, plagiarism: 2,  trustScore: 96, teacher: teacherA._id },
      { studentId: "STU207", name: "Mohit Jain",     course: "MCA", semester: 1, subject: subMap["Neural Networks"], section: "A", attendance: 91, marks: 90, aiScore: 3, plagiarism: 1,  trustScore: 97, teacher: teacherA._id },
      { studentId: "STU208", name: "Deepika Nair",   course: "MCA", semester: 1, subject: subMap["Neural Networks"], section: "A", attendance: 86, marks: 91, aiScore: 6, plagiarism: 2,  trustScore: 95, teacher: teacherA._id },

      // Networking — Poor discrimination (everyone scores 65±2)
      { studentId: "STU301", name: "Suresh Pillai",  course: "BTech", semester: 2, subject: subMap["Networking"], section: "C", attendance: 75, marks: 64, aiScore: 10, plagiarism: 5, trustScore: 80, teacher: teacherC._id },
      { studentId: "STU302", name: "Kavitha Menon",  course: "BTech", semester: 2, subject: subMap["Networking"], section: "C", attendance: 78, marks: 65, aiScore: 12, plagiarism: 4, trustScore: 82, teacher: teacherC._id },
      { studentId: "STU303", name: "Ajith Kumar",    course: "BTech", semester: 2, subject: subMap["Networking"], section: "C", attendance: 80, marks: 65, aiScore: 8,  plagiarism: 3, trustScore: 84, teacher: teacherC._id },
      { studentId: "STU304", name: "Rekha Iyer",     course: "BTech", semester: 2, subject: subMap["Networking"], section: "C", attendance: 76, marks: 66, aiScore: 11, plagiarism: 6, trustScore: 79, teacher: teacherC._id },
      { studentId: "STU305", name: "Praveen Nair",   course: "BTech", semester: 2, subject: subMap["Networking"], section: "C", attendance: 82, marks: 64, aiScore: 9,  plagiarism: 4, trustScore: 83, teacher: teacherC._id },

      // ── Feature 4: GRADING CONSISTENCY ───────────────────
      // Advanced Statistics — Section A (Teacher A, avg 74) vs Section B (Teacher B, avg 55) — 19pt gap!
      { studentId: "STU401", name: "Amrit Jha",      course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "A", attendance: 85, marks: 75, aiScore: 5, plagiarism: 2, trustScore: 90, teacher: teacherA._id },
      { studentId: "STU402", name: "Divya Singh",    course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "A", attendance: 88, marks: 74, aiScore: 4, plagiarism: 1, trustScore: 92, teacher: teacherA._id },
      { studentId: "STU403", name: "Farhan Ali",     course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "A", attendance: 82, marks: 72, aiScore: 6, plagiarism: 3, trustScore: 89, teacher: teacherA._id },
      { studentId: "STU404", name: "Gayatri Bose",   course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "A", attendance: 90, marks: 76, aiScore: 3, plagiarism: 1, trustScore: 93, teacher: teacherA._id },
      { studentId: "STU405", name: "Harish Reddy",   course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "A", attendance: 87, marks: 73, aiScore: 5, plagiarism: 2, trustScore: 91, teacher: teacherA._id },

      { studentId: "STU501", name: "Imran Malik",    course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "B", attendance: 84, marks: 55, aiScore: 6, plagiarism: 3, trustScore: 80, teacher: teacherB._id },
      { studentId: "STU502", name: "Jyoti Pandey",   course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "B", attendance: 80, marks: 57, aiScore: 5, plagiarism: 2, trustScore: 82, teacher: teacherB._id },
      { studentId: "STU503", name: "Kartik Arora",   course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "B", attendance: 78, marks: 53, aiScore: 7, plagiarism: 4, trustScore: 78, teacher: teacherB._id },
      { studentId: "STU504", name: "Lata Meena",     course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "B", attendance: 82, marks: 56, aiScore: 4, plagiarism: 2, trustScore: 83, teacher: teacherB._id },
      { studentId: "STU505", name: "Manish Tiwari",  course: "BTech", semester: 3, subject: subMap["Advanced Statistics"], section: "B", attendance: 79, marks: 54, aiScore: 6, plagiarism: 3, trustScore: 79, teacher: teacherB._id },

      // Software Engineering — Section A (teacherA, ~68) vs Section C (teacherC, ~82)
      { studentId: "STU601", name: "Neeraj Gupta",   course: "MCA", semester: 2, subject: subMap["Software Engineering"], section: "A", attendance: 80, marks: 67, aiScore: 10, plagiarism: 5, trustScore: 78, teacher: teacherA._id },
      { studentId: "STU602", name: "Ojasvi Kumar",   course: "MCA", semester: 2, subject: subMap["Software Engineering"], section: "A", attendance: 82, marks: 69, aiScore: 12, plagiarism: 4, trustScore: 79, teacher: teacherA._id },
      { studentId: "STU603", name: "Pallavi Roy",    course: "MCA", semester: 2, subject: subMap["Software Engineering"], section: "A", attendance: 78, marks: 66, aiScore: 8,  plagiarism: 6, trustScore: 77, teacher: teacherA._id },
      { studentId: "STU604", name: "Qasim Raza",     course: "MCA", semester: 2, subject: subMap["Software Engineering"], section: "A", attendance: 85, marks: 70, aiScore: 9,  plagiarism: 3, trustScore: 80, teacher: teacherA._id },

      { studentId: "STU701", name: "Ritika Sahu",    course: "MCA", semester: 2, subject: subMap["Software Engineering"], section: "C", attendance: 83, marks: 82, aiScore: 5, plagiarism: 2, trustScore: 91, teacher: teacherC._id },
      { studentId: "STU702", name: "Shubham Jain",   course: "MCA", semester: 2, subject: subMap["Software Engineering"], section: "C", attendance: 87, marks: 84, aiScore: 4, plagiarism: 1, trustScore: 93, teacher: teacherC._id },
      { studentId: "STU703", name: "Tanvi Mishra",   course: "MCA", semester: 2, subject: subMap["Software Engineering"], section: "C", attendance: 81, marks: 80, aiScore: 6, plagiarism: 3, trustScore: 90, teacher: teacherC._id },
      { studentId: "STU704", name: "Umesh Yadav",    course: "MCA", semester: 2, subject: subMap["Software Engineering"], section: "C", attendance: 89, marks: 83, aiScore: 3, plagiarism: 1, trustScore: 94, teacher: teacherC._id },

      // ── Feature 5: AUTOMATED REPORT — mixed flagged data ─
      // Database Management — mixed flags
      { studentId: "STU801", name: "Vandana Nair",   course: "BTech", semester: 4, subject: subMap["Database Management"], section: "A", attendance: 72, marks: 65, aiScore: 70, plagiarism: 60, trustScore: 28, teacher: teacherB._id, flags: ["High AI usage", "High plagiarism"] },
      { studentId: "STU802", name: "Wasim Khan",     course: "BTech", semester: 4, subject: subMap["Database Management"], section: "A", attendance: 68, marks: 60, aiScore: 80, plagiarism: 75, trustScore: 18, teacher: teacherB._id, flags: ["High AI usage", "High plagiarism", "Low trust score"] },
      { studentId: "STU803", name: "Xena Fernandez", course: "BTech", semester: 4, subject: subMap["Database Management"], section: "B", attendance: 90, marks: 88, aiScore: 5,  plagiarism: 2,  trustScore: 96, teacher: teacherC._id },
      { studentId: "STU804", name: "Yash Chopra",    course: "BTech", semester: 4, subject: subMap["Database Management"], section: "B", attendance: 88, marks: 82, aiScore: 8,  plagiarism: 3,  trustScore: 93, teacher: teacherC._id },
      { studentId: "STU805", name: "Zara Sheikh",    course: "BTech", semester: 4, subject: subMap["Database Management"], section: "B", attendance: 85, marks: 79, aiScore: 10, plagiarism: 4,  trustScore: 91, teacher: teacherC._id },
    ];

    await PerformanceRecord.insertMany(DATA);
    console.log(`✅ Seeded ${DATA.length} performance records.`);
    console.log("\n📊 Summary:");
    console.log("  • Machine Learning (Sem 1→3): Anomaly spike trigger ✓");
    console.log("  • Operating Systems (5 identical marks): Group cheating trigger ✓");
    console.log("  • Data Structures (4 identical marks): Group cheating trigger ✓");
    console.log("  • Neural Networks (all 90-94%): Too-easy assessment trigger ✓");
    console.log("  • Networking (uniform 64-66): Low discrimination trigger ✓");
    console.log("  • Advanced Statistics (Sec A 74 vs Sec B 55): Grading gap trigger ✓");
    console.log("  • Software Engineering (Sec A 68 vs Sec C 82): Grading gap trigger ✓");
    console.log("  • Database Management: Flagged records for full report ✓");
    process.exit(0);
  } catch (error) {
    console.error("❌ Reseed error:", error);
    process.exit(1);
  }
};

reseed();
