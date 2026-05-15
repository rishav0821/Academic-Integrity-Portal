import mongoose from "mongoose";
import dotenv from "dotenv";
import PerformanceRecord from "./backend/models/PerformanceRecord.js";
import User from "./backend/models/User.js";

dotenv.config({ path: './backend/.env' });

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/academic_integrity");
    console.log("Connected to DB.");

    const students = await User.find({ role: "student" });
    console.log("Registered students:", students.map(s => ({name: s.name, _id: s._id, email: s.email})));
    
    if (students.length > 0) {
      // Create a mapping of dummy IDs to registered students
      // We will loop through the top students with issues from our mock data
      const mapping = [
        "STU001", "STU002", "STU003", "STU004", "STU005",
        "STU101", "STU102", "STU103", "STU104", "STU111", "STU112",
        "STU201", "STU301", "STU401", "STU501", "STU801", "STU802", 
        "CS001", "CS002", "CS003", "CS004", "CS005"
      ];

      // Assign first registered student to STU001 (Rishav Kumar, the most prominent mock student)
      for (let i = 0; i < students.length; i++) {
        let dummyId = mapping[i] || `STU-EXTRA-${i}`;
        
        await PerformanceRecord.updateMany({ studentId: dummyId }, {
          $set: {
            student: students[i]._id,
            name: students[i].name,
            studentId: students[i].studentId || dummyId,
            email: students[i].email
          }
        });
        console.log(`Updated records of ${dummyId} to ${students[i].name}`);
        
        // Also update any records where name matches the dummy name just in case
        // But since we already updated by studentId it's probably fine.
      }
      
      // Also, update ANY remaining STU001 to the first student just in case
      await PerformanceRecord.updateMany({ studentId: "STU001" }, {
        $set: {
          student: students[0]._id,
          name: students[0].name,
          studentId: students[0].studentId || "STU001",
          email: students[0].email
        }
      });
      
      console.log("Sync complete.");
    } else {
      console.log("No registered students found.");
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
};

run();
