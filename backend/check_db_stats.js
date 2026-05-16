import mongoose from "mongoose";
import dotenv from "dotenv";
import PerformanceRecord from "./models/PerformanceRecord.js";
import User from "./models/User.js";
import Subject from "./models/Subject.js";

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB.");
    
    const recordCount = await PerformanceRecord.countDocuments();
    const userCount = await User.countDocuments();
    const subjectCount = await Subject.countDocuments();
    
    console.log(`📊 Current DB Stats:`);
    console.log(`  • PerformanceRecords: ${recordCount}`);
    console.log(`  • Users: ${userCount}`);
    console.log(`  • Subjects: ${subjectCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ DB Check error:", error);
    process.exit(1);
  }
};

checkDB();
