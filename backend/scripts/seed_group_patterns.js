import mongoose from "mongoose";
import dotenv from "dotenv";
import PerformanceRecord from "../models/PerformanceRecord.js";

// Load env from root
dotenv.config({ path: "backend/.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/academic-integrity";

// Need a simple Subject schema for seeding
const subjectSchema = new mongoose.Schema({ name: String, code: String });
const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

const seedData = async () => {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);

    // 1. Find or create the Subject to avoid CastError
    let mlSubject = await Subject.findOne({ name: /Machine Learning/i });
    if (!mlSubject) {
      console.log("Creating 'Machine Learning' subject...");
      mlSubject = await Subject.create({ name: "Machine Learning", code: "CS101" });
    }
    const subId = mlSubject._id;

    const SEED_DATA = [
      // --- Group 1: High Similarity (Copied) ---
      {
        "studentId": "STU101",
        "name": "Arjun Mehta",
        "course": "BTech CS",
        "subject": subId,
        "section": "A",
        "attendance": 82,
        "marks": 94,
        "aiScore": 85,
        "plagiarism": 92,
        "trustScore": 15,
        "answer": "The process of photosynthesis is a biological mechanism where plants convert light energy from the sun into chemical energy stored in glucose. This occurs primarily in the chloroplasts using chlorophyll to capture sunlight and transform water and carbon dioxide into sugars."
      },
      {
        "studentId": "STU102",
        "name": "Sneha Roy",
        "course": "BTech CS",
        "subject": subId,
        "section": "A",
        "attendance": 75,
        "marks": 93,
        "aiScore": 82,
        "plagiarism": 90,
        "trustScore": 18,
        "answer": "The process of photosynthesis is a biological mechanism where plants convert light energy from the sun into chemical energy stored in glucose. This occurs mainly in the chloroplasts using chlorophyll to capture sunlight and transform water and carbon dioxide into sugars."
      },
      {
        "studentId": "STU103",
        "name": "Vikram Singh",
        "course": "BTech CS",
        "subject": subId,
        "section": "A",
        "attendance": 90,
        "marks": 94,
        "aiScore": 88,
        "plagiarism": 89,
        "trustScore": 12,
        "answer": "The process of photosynthesis is a biological gear where plants convert light energy from sun into chemical energy stored in glucose. This happens primarily in the chloroplasts using chlorophyll to capture sunlight and translate water and carbon dioxide into sugars."
      },

      // --- Group 2: Moderate Similarity (Paraphrased) ---
      {
        "studentId": "STU201",
        "name": "Priya Gupta",
        "course": "BTech CS",
        "subject": subId,
        "section": "B",
        "attendance": 95,
        "marks": 78,
        "aiScore": 10,
        "plagiarism": 65,
        "trustScore": 45,
        "answer": "A binary search tree is a data structure where each node has a maximum of two children. The left child must have a value less than the parent, while the right child's value must be greater than the parent's value to ensure sorted order."
      },
      {
        "studentId": "STU202",
        "name": "Rahul Sharma",
        "course": "BTech CS",
        "subject": subId,
        "section": "B",
        "attendance": 88,
        "marks": 75,
        "aiScore": 15,
        "plagiarism": 60,
        "trustScore": 48,
        "answer": "Binary search trees are data structures where every node can have up to two child nodes. The left subtree always contains values smaller than the root, and the right subtree contains values larger, allowing for efficient searching."
      },

      // --- Group 3: Unique / Legitimate Answers ---
      {
        "studentId": "STU301",
        "name": "Anjali Verma",
        "course": "BTech CS",
        "subject": subId,
        "section": "B",
        "attendance": 98,
        "marks": 88,
        "aiScore": 5,
        "plagiarism": 5,
        "trustScore": 95,
        "answer": "The industrial revolution was a period of scientific and technological development in the 18th century that transformed agricultural societies into industrialized, urban ones through the use of steam power and new manufacturing processes."
      },
      {
        "studentId": "STU302",
        "name": "Karan Malhotra",
        "course": "BTech CS",
        "subject": subId,
        "section": "A",
        "attendance": 85,
        "marks": 82,
        "aiScore": 8,
        "plagiarism": 4,
        "trustScore": 92,
        "answer": "Mitosis is the phase of the cell cycle where the nucleus of a cell is divided into two identical nuclei, each containing the same number of chromosomes as the parent cell, facilitating growth and tissue repair."
      },
      {
        "studentId": "STU303",
        "name": "Zoya Khan",
        "course": "BTech CS",
        "subject": subId,
        "section": "C",
        "attendance": 92,
        "marks": 90,
        "aiScore": 2,
        "plagiarism": 1,
        "trustScore": 98,
        "answer": "The French Revolution began in 1789 and fundamentally changed the political landscape of Europe by replacing absolute monarchy with principles of citizenship and inalienable rights, driven by enlightenment ideals."
      }
    ];

    // Clear STU1xx, STU2xx, STU3xx and any with subject as string
    await PerformanceRecord.deleteMany({
      $or: [
        { studentId: { $regex: /^STU[123]/ } },
        { subject: "Machine Learning" }
      ]
    });

    console.log("Seeding Analysis-Ready Performance Data...");
    await PerformanceRecord.insertMany(SEED_DATA);

    console.log("✅ Seed Complete! All records now link back to a valid Subject ID.");
    
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
