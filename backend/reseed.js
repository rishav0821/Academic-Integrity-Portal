import mongoose from "mongoose";
import dotenv from "dotenv";
import PerformanceRecord from "./models/PerformanceRecord.js";
import Subject from "./models/Subject.js";

dotenv.config();

const reseed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Clear all records to start fresh
    await PerformanceRecord.deleteMany({});
    
    // Ensure subjects exist
    const subNames = ["Machine Learning", "Operating Systems", "Data Structures", "Neural Networks", "Networking"];
    const subMap = {};
    for (let name of subNames) {
       let sub = await Subject.findOne({ name });
       if (!sub) {
          sub = await Subject.create({ name, code: name.substring(0,3).toUpperCase() + "101" });
       }
       subMap[name] = sub._id;
    }

    const JSON_DATA = [
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", subject: subMap["Machine Learning"], section: "A", attendance: 78, marks: 72, aiScore: 88, plagiarism: 12, trustScore: 30 },
      { studentId: "STU002", name: "Aman Singh", course: "BTech", subject: subMap["Operating Systems"], section: "A", attendance: 85, marks: 88, aiScore: 5, plagiarism: 2, trustScore: 97 },
      { studentId: "STU003", name: "Priya Sharma", course: "MCA", subject: subMap["Data Structures"], section: "B", attendance: 69, marks: 65, aiScore: 0, plagiarism: 45, trustScore: 65 },
      { studentId: "STU004", name: "Neha Verma", course: "BTech", subject: subMap["Neural Networks"], section: "B", attendance: 60, marks: 70, aiScore: 95, plagiarism: 10, trustScore: 20 },
      { studentId: "STU005", name: "Rohan Das", course: "BTech", subject: subMap["Networking"], section: "A", attendance: 90, marks: 82, aiScore: 12, plagiarism: 5, trustScore: 92 },
      
      // Group Data
      { studentId: "STU101", name: "Arjun Mehta", course: "BTech CS", subject: subMap["Machine Learning"], section: "A", attendance: 82, marks: 94, aiScore: 85, plagiarism: 92, trustScore: 15 },
      { studentId: "STU102", name: "Sneha Roy", course: "BTech CS", subject: subMap["Machine Learning"], section: "A", attendance: 75, marks: 93, aiScore: 82, plagiarism: 90, trustScore: 18 },
      { studentId: "STU103", name: "Vikram Singh", course: "BTech CS", subject: subMap["Machine Learning"], section: "A", attendance: 90, marks: 94, aiScore: 88, plagiarism: 89, trustScore: 12 },
      
      { studentId: "STU201", name: "Priya Gupta", course: "BTech CS", subject: subMap["Machine Learning"], section: "B", attendance: 95, marks: 78, aiScore: 10, plagiarism: 65, trustScore: 45 },
      { studentId: "STU202", name: "Rahul Sharma", course: "BTech CS", subject: subMap["Machine Learning"], section: "B", attendance: 88, marks: 75, aiScore: 15, plagiarism: 60, trustScore: 48 },
      
      { studentId: "STU301", name: "Anjali Verma", course: "BTech CS", subject: subMap["Machine Learning"], section: "B", attendance: 98, marks: 88, aiScore: 5, plagiarism: 5, trustScore: 95 },
      { studentId: "STU302", name: "Karan Malhotra", course: "BTech CS", subject: subMap["Machine Learning"], section: "A", attendance: 85, marks: 82, aiScore: 8, plagiarism: 4, trustScore: 92 },
      { studentId: "STU303", name: "Zoya Khan", course: "BTech CS", subject: subMap["Machine Learning"], section: "C", attendance: 92, marks: 90, aiScore: 2, plagiarism: 1, trustScore: 98 }
    ];

    await PerformanceRecord.insertMany(JSON_DATA);
    console.log("Database seeded correctly with ObjectIds!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing DB:", error);
    process.exit(1);
  }
};

reseed();
