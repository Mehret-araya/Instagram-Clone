import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  savePost,
  unsavePost,
} from "../controllers/savedController.js";

const router = express.Router();

// Save post
router.post(
  "/:postId",
  authMiddleware,
  savePost
);

// Unsave post
router.delete(
  "/:postId",
  authMiddleware,
  unsavePost
);

export default router;