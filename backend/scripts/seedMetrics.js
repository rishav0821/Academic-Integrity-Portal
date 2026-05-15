import mongoose from "mongoose";
import dotenv from "dotenv";
import PerformanceRecord from "../models/PerformanceRecord.js";

dotenv.config({ path: "backend/.env" });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const JSON_DATA = [
  {
    "studentId": "STU001",
    "name": "Rishav Kumar",
    "course": "MCA",
    "subject": "Machine Learning",
    "section": "A",
    "attendance": 78,
    "marks": 72,
    "aiScore": 88,
    "plagiarism": 12,
    "trustScore": 30
  },
  {
    "studentId": "STU002",
    "name": "Aman Singh",
    "course": "BTech",
    "subject": "Operating Systems",
    "section": "A",
    "attendance": 85,
    "marks": 88,
    "aiScore": 5,
    "plagiarism": 2,
    "trustScore": 97
  },
  {
    "studentId": "STU003",
    "name": "Priya Sharma",
    "course": "MCA",
    "subject": "Data Structures",
    "section": "B",
    "attendance": 69,
    "marks": 65,
    "aiScore": 0,
    "plagiarism": 45,
    "trustScore": 65
  },
  {
    "studentId": "STU004",
    "name": "Neha Verma",
    "course": "BTech",
    "subject": "Neural Networks",
    "section": "B",
    "attendance": 60,
    "marks": 70,
    "aiScore": 95,
    "plagiarism": 10,
    "trustScore": 20
  },
  {
    "studentId": "STU005",
    "name": "Rohan Das",
    "course": "BTech",
    "subject": "Networking",
    "section": "A",
    "attendance": 90,
    "marks": 82,
    "aiScore": 12,
    "plagiarism": 5,
    "trustScore": 92
  }
];

const seedData = async () => {
  try {
    // Optional: Clear existing flattened mock data so we don't duplicate
    await PerformanceRecord.deleteMany({ studentId: { $exists: true } });

    console.log("Seeding New Metrics...");
    await PerformanceRecord.insertMany(JSON_DATA);
    console.log("Data Seeded Successfully!");
    
    process.exit();
  } catch (error) {
    console.error("Error with data import: ", error);
    process.exit(1);
  }
};

seedData();
