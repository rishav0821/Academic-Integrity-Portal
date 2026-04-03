import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import marksRoutes from "./routes/marks.js";
import metaRoutes from "./routes/meta.js";
import analyticsRoutes from "./routes/analytics.js";
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

import { protect } from "./middleware/authMiddleware.js";

app.get("/api/dashboard", protect, (req, res) => {
  res.json({ message: "Protected dashboard route", user: req.user });
});

const __dirname = path.resolve();
if (process.env.NODE_ENV === "production" || process.env.RENDER_ENV === "production" || process.env.NODE_ENV) {
  app.use(express.static(path.join(__dirname, "academic-integrity-frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "academic-integrity-frontend/dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
