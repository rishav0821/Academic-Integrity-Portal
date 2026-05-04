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
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 78, marks: 72, aiScore: 88, plagiarism: 12, trustScore: 30 },
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", semester: 2, subject: subMap["Machine Learning"], section: "A", attendance: 82, marks: 75, aiScore: 80, plagiarism: 10, trustScore: 35 },
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", semester: 3, subject: subMap["Machine Learning"], section: "A", attendance: 85, marks: 78, aiScore: 75, plagiarism: 8, trustScore: 40 },
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", semester: 4, subject: subMap["Machine Learning"], section: "A", attendance: 88, marks: 82, aiScore: 70, plagiarism: 5, trustScore: 50 },
      
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", semester: 1, subject: subMap["Operating Systems"], section: "A", attendance: 85, marks: 80, aiScore: 60, plagiarism: 5, trustScore: 60 },
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", semester: 2, subject: subMap["Operating Systems"], section: "A", attendance: 86, marks: 82, aiScore: 50, plagiarism: 4, trustScore: 65 },
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", semester: 3, subject: subMap["Operating Systems"], section: "A", attendance: 88, marks: 85, aiScore: 40, plagiarism: 2, trustScore: 80 },
      { studentId: "STU001", name: "Rishav Kumar", course: "MCA", semester: 4, subject: subMap["Operating Systems"], section: "A", attendance: 90, marks: 88, aiScore: 20, plagiarism: 1, trustScore: 90 },

      { studentId: "STU002", name: "Aman Singh", course: "BTech", semester: 1, subject: subMap["Operating Systems"], section: "A", attendance: 85, marks: 88, aiScore: 5, plagiarism: 2, trustScore: 97 },
      { studentId: "STU003", name: "Priya Sharma", course: "MCA", semester: 1, subject: subMap["Data Structures"], section: "B", attendance: 69, marks: 65, aiScore: 0, plagiarism: 45, trustScore: 65 },
      { studentId: "STU004", name: "Neha Verma", course: "BTech", semester: 1, subject: subMap["Neural Networks"], section: "B", attendance: 60, marks: 70, aiScore: 95, plagiarism: 10, trustScore: 20 },
      { studentId: "STU005", name: "Rohan Das", course: "BTech", semester: 1, subject: subMap["Networking"], section: "A", attendance: 90, marks: 82, aiScore: 12, plagiarism: 5, trustScore: 92 },
      
      // Group Data
      { studentId: "STU101", name: "Arjun Mehta", course: "BTech CS", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 82, marks: 94, aiScore: 85, plagiarism: 92, trustScore: 15 },
      { studentId: "STU102", name: "Sneha Roy", course: "BTech CS", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 75, marks: 93, aiScore: 82, plagiarism: 90, trustScore: 18 },
      { studentId: "STU103", name: "Vikram Singh", course: "BTech CS", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 90, marks: 94, aiScore: 88, plagiarism: 89, trustScore: 12 },
      
      { studentId: "STU201", name: "Priya Gupta", course: "BTech CS", semester: 1, subject: subMap["Machine Learning"], section: "B", attendance: 95, marks: 78, aiScore: 10, plagiarism: 65, trustScore: 45 },
      { studentId: "STU202", name: "Rahul Sharma", course: "BTech CS", semester: 1, subject: subMap["Machine Learning"], section: "B", attendance: 88, marks: 75, aiScore: 15, plagiarism: 60, trustScore: 48 },
      
      { studentId: "STU301", name: "Anjali Verma", course: "BTech CS", semester: 1, subject: subMap["Machine Learning"], section: "B", attendance: 98, marks: 88, aiScore: 5, plagiarism: 5, trustScore: 95 },
      { studentId: "STU302", name: "Karan Malhotra", course: "BTech CS", semester: 1, subject: subMap["Machine Learning"], section: "A", attendance: 85, marks: 82, aiScore: 8, plagiarism: 4, trustScore: 92 },
      { studentId: "STU303", name: "Zoya Khan", course: "BTech CS", semester: 1, subject: subMap["Machine Learning"], section: "C", attendance: 92, marks: 90, aiScore: 2, plagiarism: 1, trustScore: 98 }
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
