import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    const users = await User.find({});
    console.log("Users in DB:", users.map(u => ({ email: u.email, name: u.name })));
    mongoose.disconnect();
};
run();
