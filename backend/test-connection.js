import connectDB from "./config/db.js";

async function testConnection() {
  console.log("Checking MongoDB connection...");
  try {
    await connectDB();
    console.log("Connected successfully! Exiting test...");
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
