import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import profileUpload from "../middleware/profileUploadMiddleware.js";

import {
  getUserProfile,
  updateProfile,
  getUserProfileWithPosts,
} from "../controllers/userController.js";

const router = express.Router();

// ========================================
// GET BASIC USER PROFILE
// ========================================
router.get(
  "/:id",
  authMiddleware,
  getUserProfile
);


// ========================================
// UPDATE USER PROFILE
// Bio + Website + Profile Picture
// ========================================
router.put(
  "/profile",
  authMiddleware,
  profileUpload.single("profilePicture"),
  updateProfile
);


// ========================================
// GET USER PROFILE WITH POSTS
// ========================================
router.get(
  "/profile/:id",
  authMiddleware,
  getUserProfileWithPosts
);

export default router;

