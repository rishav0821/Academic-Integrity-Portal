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
      // Semester 1 & 2
      "Programming Fundamentals",
      "Mathematics for Computing",
      "Digital Logic Design",
      "Data Structures",
      "Discrete Mathematics",

      // Semester 3 & 4
      "Object Oriented Programming",
      "Operating Systems",
      "Database Management",
      "Computer Organization & Architecture",
      "Theory of Computation",

      // Semester 5 & 6
      "Algorithms Design & Analysis",
      "Software Engineering",
      "Computer Networks",
      "Advanced Statistics",
      "Compiler Design",

      // Semester 7 & 8
      "Machine Learning",
      "Artificial Intelligence",
      "Neural Networks",
      "Cloud Computing",
      "Cyber Security",
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

      // ── NEW CS SUBJECTS — Semesters 1–8 ──────────────────

      // Programming Fundamentals — Sem 1 (mixed class)
      { studentId: "CS001", name: "Aditya Pandey",    course: "BTech CS", semester: 1, subject: subMap["Programming Fundamentals"], section: "A", attendance: 85, marks: 72, aiScore: 10, plagiarism: 5,  trustScore: 88, teacher: teacherA._id },
      { studentId: "CS002", name: "Bhavna Singh",     course: "BTech CS", semester: 1, subject: subMap["Programming Fundamentals"], section: "A", attendance: 90, marks: 68, aiScore: 8,  plagiarism: 3,  trustScore: 90, teacher: teacherA._id },
      { studentId: "CS003", name: "Chirag Mehta",     course: "BTech CS", semester: 1, subject: subMap["Programming Fundamentals"], section: "A", attendance: 78, marks: 55, aiScore: 15, plagiarism: 8,  trustScore: 75, teacher: teacherA._id },
      { studentId: "CS004", name: "Diya Rao",         course: "BTech CS", semester: 1, subject: subMap["Programming Fundamentals"], section: "B", attendance: 82, marks: 80, aiScore: 5,  plagiarism: 2,  trustScore: 93, teacher: teacherB._id },
      { studentId: "CS005", name: "Eshan Malhotra",   course: "BTech CS", semester: 1, subject: subMap["Programming Fundamentals"], section: "B", attendance: 75, marks: 61, aiScore: 20, plagiarism: 12, trustScore: 70, teacher: teacherB._id },

      // Mathematics for Computing — Sem 1
      { studentId: "CS001", name: "Aditya Pandey",    course: "BTech CS", semester: 1, subject: subMap["Mathematics for Computing"], section: "A", attendance: 88, marks: 65, aiScore: 5,  plagiarism: 2,  trustScore: 87, teacher: teacherA._id },
      { studentId: "CS002", name: "Bhavna Singh",     course: "BTech CS", semester: 1, subject: subMap["Mathematics for Computing"], section: "A", attendance: 91, marks: 78, aiScore: 3,  plagiarism: 1,  trustScore: 92, teacher: teacherA._id },
      { studentId: "CS003", name: "Chirag Mehta",     course: "BTech CS", semester: 1, subject: subMap["Mathematics for Computing"], section: "A", attendance: 76, marks: 52, aiScore: 10, plagiarism: 5,  trustScore: 72, teacher: teacherA._id },
      { studentId: "CS006", name: "Fatima Qureshi",   course: "BTech CS", semester: 1, subject: subMap["Mathematics for Computing"], section: "B", attendance: 94, marks: 88, aiScore: 2,  plagiarism: 1,  trustScore: 96, teacher: teacherB._id },
      { studentId: "CS007", name: "Gaurav Tiwari",    course: "BTech CS", semester: 1, subject: subMap["Mathematics for Computing"], section: "B", attendance: 80, marks: 60, aiScore: 8,  plagiarism: 4,  trustScore: 80, teacher: teacherB._id },

      // Digital Logic Design — Sem 1
      { studentId: "CS001", name: "Aditya Pandey",    course: "BTech CS", semester: 1, subject: subMap["Digital Logic Design"], section: "A", attendance: 83, marks: 70, aiScore: 6,  plagiarism: 3,  trustScore: 85, teacher: teacherC._id },
      { studentId: "CS004", name: "Diya Rao",         course: "BTech CS", semester: 1, subject: subMap["Digital Logic Design"], section: "A", attendance: 87, marks: 76, aiScore: 4,  plagiarism: 2,  trustScore: 90, teacher: teacherC._id },
      { studentId: "CS008", name: "Hema Pillai",      course: "BTech CS", semester: 1, subject: subMap["Digital Logic Design"], section: "B", attendance: 79, marks: 58, aiScore: 12, plagiarism: 7,  trustScore: 74, teacher: teacherC._id },
      { studentId: "CS009", name: "Ishan Kapoor",     course: "BTech CS", semester: 1, subject: subMap["Digital Logic Design"], section: "B", attendance: 85, marks: 74, aiScore: 7,  plagiarism: 3,  trustScore: 87, teacher: teacherC._id },

      // Discrete Mathematics — Sem 2
      { studentId: "CS002", name: "Bhavna Singh",     course: "BTech CS", semester: 2, subject: subMap["Discrete Mathematics"], section: "A", attendance: 88, marks: 73, aiScore: 6,  plagiarism: 2,  trustScore: 89, teacher: teacherA._id },
      { studentId: "CS005", name: "Eshan Malhotra",   course: "BTech CS", semester: 2, subject: subMap["Discrete Mathematics"], section: "A", attendance: 72, marks: 50, aiScore: 18, plagiarism: 10, trustScore: 65, teacher: teacherA._id },
      { studentId: "CS006", name: "Fatima Qureshi",   course: "BTech CS", semester: 2, subject: subMap["Discrete Mathematics"], section: "B", attendance: 95, marks: 85, aiScore: 2,  plagiarism: 1,  trustScore: 97, teacher: teacherB._id },
      { studentId: "CS010", name: "Jai Sharma",       course: "BTech CS", semester: 2, subject: subMap["Discrete Mathematics"], section: "B", attendance: 82, marks: 63, aiScore: 10, plagiarism: 5,  trustScore: 78, teacher: teacherB._id },

      // Object Oriented Programming — Sem 3
      { studentId: "CS001", name: "Aditya Pandey",    course: "BTech CS", semester: 3, subject: subMap["Object Oriented Programming"], section: "A", attendance: 86, marks: 78, aiScore: 8,  plagiarism: 4,  trustScore: 86, teacher: teacherA._id },
      { studentId: "CS002", name: "Bhavna Singh",     course: "BTech CS", semester: 3, subject: subMap["Object Oriented Programming"], section: "A", attendance: 90, marks: 82, aiScore: 5,  plagiarism: 2,  trustScore: 91, teacher: teacherA._id },
      { studentId: "CS003", name: "Chirag Mehta",     course: "BTech CS", semester: 3, subject: subMap["Object Oriented Programming"], section: "A", attendance: 74, marks: 60, aiScore: 20, plagiarism: 15, trustScore: 65, teacher: teacherA._id, flags: ["High plagiarism"] },
      { studentId: "CS011", name: "Kriti Bose",       course: "BTech CS", semester: 3, subject: subMap["Object Oriented Programming"], section: "B", attendance: 88, marks: 85, aiScore: 4,  plagiarism: 1,  trustScore: 93, teacher: teacherB._id },
      { studentId: "CS012", name: "Lakshay Gupta",    course: "BTech CS", semester: 3, subject: subMap["Object Oriented Programming"], section: "B", attendance: 78, marks: 67, aiScore: 14, plagiarism: 8,  trustScore: 74, teacher: teacherB._id },

      // Computer Organization & Architecture — Sem 3
      { studentId: "CS004", name: "Diya Rao",         course: "BTech CS", semester: 3, subject: subMap["Computer Organization & Architecture"], section: "A", attendance: 84, marks: 71, aiScore: 7,  plagiarism: 3,  trustScore: 84, teacher: teacherC._id },
      { studentId: "CS007", name: "Gaurav Tiwari",    course: "BTech CS", semester: 3, subject: subMap["Computer Organization & Architecture"], section: "A", attendance: 80, marks: 65, aiScore: 10, plagiarism: 5,  trustScore: 79, teacher: teacherC._id },
      { studentId: "CS013", name: "Meena Arora",      course: "BTech CS", semester: 3, subject: subMap["Computer Organization & Architecture"], section: "B", attendance: 90, marks: 79, aiScore: 5,  plagiarism: 2,  trustScore: 90, teacher: teacherC._id },

      // Theory of Computation — Sem 4 (harder subject, lower scores)
      { studentId: "CS001", name: "Aditya Pandey",    course: "BTech CS", semester: 4, subject: subMap["Theory of Computation"], section: "A", attendance: 80, marks: 55, aiScore: 12, plagiarism: 6,  trustScore: 75, teacher: teacherA._id },
      { studentId: "CS003", name: "Chirag Mehta",     course: "BTech CS", semester: 4, subject: subMap["Theory of Computation"], section: "A", attendance: 70, marks: 48, aiScore: 20, plagiarism: 12, trustScore: 60, teacher: teacherA._id, flags: ["Low marks", "High AI usage"] },
      { studentId: "CS006", name: "Fatima Qureshi",   course: "BTech CS", semester: 4, subject: subMap["Theory of Computation"], section: "B", attendance: 92, marks: 72, aiScore: 4,  plagiarism: 2,  trustScore: 90, teacher: teacherB._id },
      { studentId: "CS014", name: "Nikhil Verma",     course: "BTech CS", semester: 4, subject: subMap["Theory of Computation"], section: "B", attendance: 75, marks: 50, aiScore: 15, plagiarism: 8,  trustScore: 68, teacher: teacherB._id },

      // Algorithms Design & Analysis — Sem 5
      { studentId: "CS001", name: "Aditya Pandey",    course: "BTech CS", semester: 5, subject: subMap["Algorithms Design & Analysis"], section: "A", attendance: 87, marks: 76, aiScore: 9,  plagiarism: 4,  trustScore: 85, teacher: teacherA._id },
      { studentId: "CS002", name: "Bhavna Singh",     course: "BTech CS", semester: 5, subject: subMap["Algorithms Design & Analysis"], section: "A", attendance: 91, marks: 80, aiScore: 6,  plagiarism: 2,  trustScore: 90, teacher: teacherA._id },
      { studentId: "CS004", name: "Diya Rao",         course: "BTech CS", semester: 5, subject: subMap["Algorithms Design & Analysis"], section: "A", attendance: 85, marks: 74, aiScore: 8,  plagiarism: 3,  trustScore: 87, teacher: teacherA._id },
      { studentId: "CS015", name: "Om Prakash",       course: "BTech CS", semester: 5, subject: subMap["Algorithms Design & Analysis"], section: "B", attendance: 78, marks: 62, aiScore: 16, plagiarism: 9,  trustScore: 71, teacher: teacherB._id },

      // Computer Networks — Sem 5
      { studentId: "CS005", name: "Eshan Malhotra",   course: "BTech CS", semester: 5, subject: subMap["Computer Networks"], section: "A", attendance: 74, marks: 58, aiScore: 22, plagiarism: 14, trustScore: 62, teacher: teacherB._id, flags: ["High plagiarism"] },
      { studentId: "CS006", name: "Fatima Qureshi",   course: "BTech CS", semester: 5, subject: subMap["Computer Networks"], section: "A", attendance: 93, marks: 84, aiScore: 3,  plagiarism: 1,  trustScore: 96, teacher: teacherB._id },
      { studentId: "CS011", name: "Kriti Bose",       course: "BTech CS", semester: 5, subject: subMap["Computer Networks"], section: "B", attendance: 86, marks: 77, aiScore: 7,  plagiarism: 3,  trustScore: 88, teacher: teacherC._id },
      { studentId: "CS016", name: "Prerna Joshi",     course: "BTech CS", semester: 5, subject: subMap["Computer Networks"], section: "B", attendance: 80, marks: 69, aiScore: 11, plagiarism: 6,  trustScore: 79, teacher: teacherC._id },

      // Compiler Design — Sem 6
      { studentId: "CS001", name: "Aditya Pandey",    course: "BTech CS", semester: 6, subject: subMap["Compiler Design"], section: "A", attendance: 84, marks: 68, aiScore: 10, plagiarism: 5,  trustScore: 82, teacher: teacherA._id },
      { studentId: "CS007", name: "Gaurav Tiwari",    course: "BTech CS", semester: 6, subject: subMap["Compiler Design"], section: "A", attendance: 79, marks: 60, aiScore: 14, plagiarism: 7,  trustScore: 74, teacher: teacherA._id },
      { studentId: "CS012", name: "Lakshay Gupta",    course: "BTech CS", semester: 6, subject: subMap["Compiler Design"], section: "B", attendance: 88, marks: 75, aiScore: 6,  plagiarism: 3,  trustScore: 86, teacher: teacherC._id },

      // Artificial Intelligence — Sem 7
      { studentId: "CS002", name: "Bhavna Singh",     course: "BTech CS", semester: 7, subject: subMap["Artificial Intelligence"], section: "A", attendance: 90, marks: 82, aiScore: 8,  plagiarism: 3,  trustScore: 89, teacher: teacherA._id },
      { studentId: "CS004", name: "Diya Rao",         course: "BTech CS", semester: 7, subject: subMap["Artificial Intelligence"], section: "A", attendance: 88, marks: 79, aiScore: 10, plagiarism: 4,  trustScore: 86, teacher: teacherA._id },
      { studentId: "CS006", name: "Fatima Qureshi",   course: "BTech CS", semester: 7, subject: subMap["Artificial Intelligence"], section: "A", attendance: 95, marks: 90, aiScore: 3,  plagiarism: 1,  trustScore: 97, teacher: teacherA._id },
      { studentId: "CS017", name: "Raj Nair",         course: "BTech CS", semester: 7, subject: subMap["Artificial Intelligence"], section: "B", attendance: 76, marks: 63, aiScore: 35, plagiarism: 28, trustScore: 45, teacher: teacherB._id, flags: ["High AI usage", "High plagiarism"] },

      // Cloud Computing — Sem 7
      { studentId: "CS001", name: "Aditya Pandey",    course: "BTech CS", semester: 7, subject: subMap["Cloud Computing"], section: "A", attendance: 86, marks: 74, aiScore: 9,  plagiarism: 4,  trustScore: 84, teacher: teacherC._id },
      { studentId: "CS003", name: "Chirag Mehta",     course: "BTech CS", semester: 7, subject: subMap["Cloud Computing"], section: "A", attendance: 80, marks: 68, aiScore: 18, plagiarism: 10, trustScore: 68, teacher: teacherC._id },
      { studentId: "CS013", name: "Meena Arora",      course: "BTech CS", semester: 7, subject: subMap["Cloud Computing"], section: "B", attendance: 91, marks: 80, aiScore: 5,  plagiarism: 2,  trustScore: 92, teacher: teacherC._id },

      // Cyber Security — Sem 8
      { studentId: "CS002", name: "Bhavna Singh",     course: "BTech CS", semester: 8, subject: subMap["Cyber Security"], section: "A", attendance: 92, marks: 86, aiScore: 6,  plagiarism: 2,  trustScore: 93, teacher: teacherA._id },
      { studentId: "CS006", name: "Fatima Qureshi",   course: "BTech CS", semester: 8, subject: subMap["Cyber Security"], section: "A", attendance: 96, marks: 91, aiScore: 2,  plagiarism: 1,  trustScore: 98, teacher: teacherA._id },
      { studentId: "CS018", name: "Sameer Hussain",   course: "BTech CS", semester: 8, subject: subMap["Cyber Security"], section: "B", attendance: 82, marks: 72, aiScore: 12, plagiarism: 6,  trustScore: 82, teacher: teacherB._id },
      { studentId: "CS019", name: "Tanya Misra",      course: "BTech CS", semester: 8, subject: subMap["Cyber Security"], section: "B", attendance: 78, marks: 65, aiScore: 20, plagiarism: 15, trustScore: 65, teacher: teacherB._id },
      { studentId: "CS020", name: "Uday Shankar",     course: "BTech CS", semester: 8, subject: subMap["Cyber Security"], section: "B", attendance: 70, marks: 58, aiScore: 40, plagiarism: 35, trustScore: 40, teacher: teacherB._id, flags: ["High AI usage", "High plagiarism", "Low trust score"] },
    ];

    await PerformanceRecord.insertMany(DATA);
    console.log(`✅ Seeded ${DATA.length} performance records across 20 CS subjects.`);
    console.log("\n📚 CS Subjects seeded:");
    subNames.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    console.log("\n📊 Intelligence triggers:");
    console.log("  • Anomaly: Machine Learning Sem1→3 spike ✓");
    console.log("  • Group Cheating: OS (5 identical), DS (4 identical) ✓");
    console.log("  • Assessment Quality: Neural Networks too-easy ✓");
    console.log("  • Grading Consistency: Adv. Stats 19-mark gap ✓");
    console.log("  • Full Report: 12+ flagged records across subjects ✓");
    process.exit(0);
  } catch (error) {
    console.error("❌ Reseed error:", error);
    process.exit(1);
  }
};

reseed();
