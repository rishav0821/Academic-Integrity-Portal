import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import marksRoutes from "./routes/marks.js";
import metaRoutes from "./routes/meta.js";
import analyticsRoutes from "./routes/analytics.js";
import reportsRoutes from "./routes/reports.js";
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

import { protect } from "./middleware/authMiddleware.js";

app.get("/api/dashboard", protect, (req, res) => {
  res.json({ message: "Protected dashboard route", user: req.user });
});

const __dirname = path.resolve();

// Only serve static files in production
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const frontendPath = path.join(__dirname, "academic-integrity-frontend", "dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

// Only start the server if not running on Vercel (where Vercel handles the server lifecycle)
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
