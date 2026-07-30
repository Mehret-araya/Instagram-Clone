import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  likePost,
  unlikePost,
} from "../controllers/likeController.js";

const router = express.Router();

// Like a post
router.post("/:id", authMiddleware, likePost);

// Unlike a post
router.delete("/:id", authMiddleware, unlikePost);

export default router;