import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  addComment,
  deleteComment,
  addReply,
} from "../controllers/commentController.js";

const router = express.Router();

// Add Comment
router.post(
  "/:id",
  authMiddleware,
  addComment
);

// Delete Comment
router.delete(
  "/:postId/:commentId",
  authMiddleware,
  deleteComment
);

// Add Reply
router.post(
  "/:postId/:commentId/reply",
  authMiddleware,
  addReply
);

export default router;