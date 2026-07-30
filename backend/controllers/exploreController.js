import Post from "../models/Post.js";
import User from "../models/User.js";

// Get Trending Hashtags
export const getTrendingHashtags = async (req, res) => {
  try {

    const hashtags = await Post.aggregate([
      {
        $unwind: "$hashtags"
      },
      {
        $group: {
          _id: "$hashtags",
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      message: "Trending hashtags fetched successfully",
      hashtags,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Get Recommended Users
export const getRecommendations = async (req, res) => {
  try {

    const currentUser = await User.findById(req.user._id)
      .populate("following");

    const followingIds = currentUser.following.map(
      user => user._id
    );


    const recommendations = await User.find({
      _id: {
        $nin: [
          ...followingIds,
          currentUser._id
        ]
      }
    })
      .select("-password")
      .limit(10);


    res.status(200).json({
      message: "Recommendations fetched successfully",
      count: recommendations.length,
      users: recommendations
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
// Get Suggested Users
export const getSuggestedUsers = async (req, res) => {
  try {

    const currentUser = await User.findById(req.user._id);

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

    res.status(500).json({
      message: error.message,
    });

  }
};
// Get Popular Posts
export const getPopularPosts = async (req, res) => {
  try {

    const posts = await Post.aggregate([
      {
        $addFields: {
          engagement: {
            $add: [
              { $size: "$likes" },
              { $size: "$comments" }
            ]
          }
        }
      },
      {
        $sort: {
          engagement: -1
        }
      },
      {
        $limit: 20
      }
    ]);


    res.status(200).json({
      message: "Popular posts fetched successfully",
      posts
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};