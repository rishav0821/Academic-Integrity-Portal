import express from "express";
import { getNotifications } from "../controllers/notificationsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);

export default router;
