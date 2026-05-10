import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);

export default router;
