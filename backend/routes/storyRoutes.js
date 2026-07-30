import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
    createStory,
    getStories,
    viewStory,
} from "../controllers/storyController.js";


const router = express.Router();


// Create Story
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createStory
);


// Get Active Stories
router.get(
    "/",
    authMiddleware,
    getStories
);

// View Story
router.put(
    "/:id/view",
    authMiddleware,
    viewStory
);


export default router;