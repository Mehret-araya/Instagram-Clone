import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  followUser,
  unfollowUser,
} from "../controllers/followController.js";

const router = express.Router();

// Follow a user
router.post("/:id", authMiddleware, followUser);

// Unfollow a user
router.delete("/:id", authMiddleware, unfollowUser);

export default router;