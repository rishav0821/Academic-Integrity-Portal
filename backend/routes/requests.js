import express from "express";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  respondToRequest,
  deleteRequest
} from "../controllers/requestsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",          protect, createRequest);
router.get("/mine",       protect, getMyRequests);
router.get("/",           protect, authorizeRoles("teacher", "admin"), getAllRequests);
router.put("/:id/respond", protect, authorizeRoles("teacher", "admin"), respondToRequest);
router.delete("/:id",    protect, deleteRequest);

export default router;
