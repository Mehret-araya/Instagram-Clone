import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getPopularPosts,
  getTrendingHashtags,
  getSuggestedUsers,
  getRecommendations
} from "../controllers/exploreController.js";


const router = express.Router();


// Popular Posts
router.get(
  "/popular",
  authMiddleware,
  getPopularPosts
);

// Trending Hashtags
router.get(
  "/hashtags",
  authMiddleware,
  getTrendingHashtags
);
// Suggested Users
router.get(
  "/users",
  authMiddleware,
  getSuggestedUsers
);

router.get(
  "/recommendations",
  authMiddleware,
  getRecommendations
);
export default router;