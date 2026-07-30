import express from "express";

import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();


// Get All Posts
router.get("/", getAllPosts);


// Get Single Post
router.get("/:id", getPostById);


// Create Post
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createPost
);


// Update Post
router.put(
  "/:id",
  authMiddleware,
  updatePost
);


// Delete Post
router.delete(
  "/:id",
  authMiddleware,
  deletePost
);

export default router;