
import User from "../models/User.js";
import Post from "../models/Post.js";

// Save Recent Search
export const saveRecentSearch = async (req, res, next) => {
  try {
    const { search } = req.body;

    if (!search || !search.trim()) {
      return res.status(400).json({
        message: "Search term is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const searchTerm = search.trim();

    // Remove duplicate searches (case-insensitive)
    user.recentSearches = user.recentSearches.filter(
      (item) =>
        item.toLowerCase() !== searchTerm.toLowerCase()
    );

    // Add the latest search at the beginning
    user.recentSearches.unshift(searchTerm);

    // Keep only the last 10 searches
    user.recentSearches = user.recentSearches.slice(0, 10);

    await user.save();

    res.status(200).json({
      message: "Search saved successfully",
      recentSearches: user.recentSearches,
    });
  } catch (error) {
    console.error("SAVE RECENT SEARCH ERROR:", error);
    next(error);
  }
};

// Get Recent Searches
export const getRecentSearches = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("recentSearches");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      recentSearches: user.recentSearches,
    });
  } catch (error) {
    console.error("GET RECENT SEARCHES ERROR:", error);
    next(error);
  }
};

// Search Users
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const users = await User.find({
      username: {
        $regex: q.trim(),
        $options: "i",
      },
    }).select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);
    next(error);
  }
};

// Search Hashtags
export const searchHashtags = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const posts = await Post.find({
      hashtags: {
        $regex: q.trim(),
        $options: "i",
      },
    }).populate("user", "username profilePicture");

    res.status(200).json({
      message: "Hashtags found successfully",
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("SEARCH HASHTAGS ERROR:", error);
    next(error);
  }
};

// Search Posts
export const searchPosts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const posts = await Post.find({
      caption: {
        $regex: q.trim(),
        $options: "i",
      },
    }).populate("user", "username profilePicture");

    res.status(200).json({
      message: "Posts fetched successfully",
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("SEARCH POSTS ERROR:", error);
    next(error);
  }
};
