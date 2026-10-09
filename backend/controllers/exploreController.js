
import Post from "../models/Post.js";
import User from "../models/User.js";

// Get Trending Hashtags
export const getTrendingHashtags = async (req, res, next) => {
  try {
    const hashtags = await Post.aggregate([
      {
        $unwind: "$hashtags",
      },
      {
        $group: {
          _id: "$hashtags",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      message: "Trending hashtags fetched successfully",
      hashtags,
    });
  } catch (error) {
    console.error("GET TRENDING HASHTAGS ERROR:", error);
    next(error);
  }
};

// Get Recommended Users
export const getRecommendations = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate("following");

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followingIds = currentUser.following.map(
      (user) => user._id
    );

    const recommendations = await User.find({
      _id: {
        $nin: [...followingIds, currentUser._id],
      },
    })
      .select("-password")
      .limit(10);

    res.status(200).json({
      message: "Recommendations fetched successfully",
      count: recommendations.length,
      users: recommendations,
    });
  } catch (error) {
    console.error("GET RECOMMENDATIONS ERROR:", error);
    next(error);
  }
};

// Get Suggested Users
export const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const suggestedUsers = await User.find({
      _id: {
        $nin: [
          ...currentUser.following,
          currentUser._id,
        ],
      },
    })
      .select("-password")
      .limit(10);

    res.status(200).json({
      message: "Suggested users fetched successfully",
      count: suggestedUsers.length,
      users: suggestedUsers,
    });
  } catch (error) {
    console.error("GET SUGGESTED USERS ERROR:", error);
    next(error);
  }
};

// Get Popular Posts
export const getPopularPosts = async (req, res, next) => {
  try {
    const posts = await Post.aggregate([
      {
        $addFields: {
          engagement: {
            $add: [
              { $size: { $ifNull: ["$likes", []] } },
              { $size: { $ifNull: ["$comments", []] } },
            ],
          },
        },
      },
      {
        $sort: {
          engagement: -1,
        },
      },
      {
        $limit: 20,
      },
    ]);

    res.status(200).json({
      message: "Popular posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("GET POPULAR POSTS ERROR:", error);
    next(error);
  }
};
