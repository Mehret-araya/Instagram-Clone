import User from "../models/User.js";
import Post from "../models/Post.js";

// ========================================
// GET USER PROFILE
// ========================================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });

  } catch (error) {
    console.error(
      "GET USER PROFILE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// GET USER PROFILE WITH POSTS
// ========================================
export const getUserProfileWithPosts = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await Post.find({
      user: req.params.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message:
        "User profile fetched successfully",

      user: {
        id: user._id,
        username: user.username,
        profilePicture:
          user.profilePicture,
        bio: user.bio,
        website: user.website,

        postCount: posts.length,

        followers:
          user.followers.length,

        following:
          user.following.length,

        posts,
      },
    });

  } catch (error) {
    console.error(
      "GET PROFILE WITH POSTS ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// UPDATE USER PROFILE
// ========================================
export const updateProfile = async (
  req,
  res
) => {
  try {
    const { bio, website } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update bio
    if (bio !== undefined) {
      user.bio = bio;
    }

    // Update website
    if (website !== undefined) {
      user.website = website;
    }

    // Update profile picture
    if (req.file) {
      user.profilePicture = req.file.path;
    }

    await user.save();

    res.status(200).json({
      message:
        "Profile updated successfully",

      user: {
        username: user.username,
        bio: user.bio,
        website: user.website,
        profilePicture:
          user.profilePicture,
      },
    });

  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

