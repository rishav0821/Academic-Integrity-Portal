import mongoose from "mongoose";

mongoose.connect("mongodb+srv://rishavkr696:Rishav007@cluster0.ae9rzqg.mongodb.net/?appName=Cluster0")
  .then(async () => {
    console.log("Connected");
    const users = await mongoose.connection.collection("users").find({}).toArray();
    console.log("Total users in users collection:", users.length);
    console.log("Prateek users:", users.filter(u => u.email.includes("prateek")));
    process.exit(0);
  });
