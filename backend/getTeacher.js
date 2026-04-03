import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config({ path: "backend/.env" });

mongoose.connect(process.env.MONGO_URI);

const ensureTeacher = async () => {
  try {
    let teacher = await User.findOne({ role: "teacher" });
    if (!teacher) {
      console.log("No teacher found. Creating a test teacher profile 'admin@upes.ac.in'...");
      teacher = await User.create({
        name: "Professor Admin",
        email: "admin@upes.ac.in",
        password: "password123",
        role: "teacher"
      });
      console.log("Created successfully!");
    }
    console.log("--- TEACHER CREDENTIALS ---");
    console.log("Email:", teacher.email);
    console.log("Password:", "password123 (or the generic password you previously registered that account under)");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

ensureTeacher();
