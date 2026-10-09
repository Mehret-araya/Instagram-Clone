
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getNotifications,

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



export default router;
