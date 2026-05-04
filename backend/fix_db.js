import mongoose from "mongoose";
import dotenv from "dotenv";
import PerformanceRecord from "./models/PerformanceRecord.js";
import Subject from "./models/Subject.js";

dotenv.config();

const fixDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Find all records where subject is a string
    const records = await PerformanceRecord.find({ subject: { $type: "string" } });
    console.log(`Found ${records.length} records with string subjects.`);

    for (let record of records) {
      // Find or create subject
      let sub = await Subject.findOne({ name: record.subject });
      if (!sub) {
        sub = await Subject.create({ name: record.subject, code: record.subject.substring(0, 4).toUpperCase() + "101" });
      }
      
      record.subject = sub._id;
      await record.save();
      console.log(`Fixed record for student ${record.studentId}`);
    }

    console.log("Database fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing DB:", error);
    process.exit(1);
  }
};

fixDb();
