import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  searchUsers,
  searchPosts,
  searchHashtags,
  saveRecentSearch,
  getRecentSearches
} from "../controllers/searchController.js";

const router = express.Router();

// Search Users
router.get("/users", authMiddleware, searchUsers);

// Search Posts
router.get("/posts", authMiddleware, searchPosts);
router.get("/hashtags", authMiddleware, searchHashtags);
router.post(
 "/recent",
 authMiddleware,
 saveRecentSearch
);


router.get(
 "/recent",
 authMiddleware,
 getRecentSearches
);

export default router;