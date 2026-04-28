import express from "express";
import dotenv from "dotenv";
import connectDB from "../backend/config/db.js";
import authRoutes from "../backend/routes/auth.js";
import marksRoutes from "../backend/routes/marks.js";
import metaRoutes from "../backend/routes/meta.js";
import analyticsRoutes from "../backend/routes/analytics.js";
import reportsRoutes from "../backend/routes/reports.js";
import cors from "cors";

dotenv.config();
process.env.JWT_SECRET = "my_super_secret_key_123";
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportsRoutes);

export default app;
