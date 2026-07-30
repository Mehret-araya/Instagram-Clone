import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getPopularPosts
} from "../controllers/exploreController.js";


const router = express.Router();


// Popular Posts
router.get(
  "/popular",
  authMiddleware,
  getPopularPosts
);


export default router;