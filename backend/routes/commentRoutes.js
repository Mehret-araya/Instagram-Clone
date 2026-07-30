import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addComment } from "../controllers/commentController.js";

const router = express.Router();

// Add Comment
router.post("/:id", authMiddleware, addComment);

export default router;
