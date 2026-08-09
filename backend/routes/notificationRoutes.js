
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getNotifications,
  createNotification,
  markAsRead,

} from "../controllers/notificationController.js";

const router = express.Router();

// Get notifications
router.get(
  "/",
  authMiddleware,
  getNotifications
);
router.put(
  "/:id/read",
  authMiddleware,
  markAsRead
);

// Create notification
router.post(
  "/",
  authMiddleware,
  createNotification
);

export default router;

