import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getUserProfile,
  updateProfile,
  getUserProfileWithPosts
} from "../controllers/userController.js";


const router = express.Router();


// Get basic user profile
router.get(
  "/:id",
  authMiddleware,
  getUserProfile
);


// Update user profile (bio, website)
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);


// Get user profile with posts
router.get(
  "/profile/:id",
  authMiddleware,
  getUserProfileWithPosts
);


export default router;