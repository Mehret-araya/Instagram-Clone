
import User from "../models/User.js";
import Post from "../models/Post.js";

// Get User Profile
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

    res.status(500).json({
      message: error.message,
    });

  }
};

// Get User Profile With Posts
export const getUserProfileWithPosts = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password");


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    const posts = await Post.find({
      user: req.params.id
    })
    .sort({
      createdAt: -1
    });


res.status(200).json({
  message: "User profile fetched successfully",

user: {
    id: user._id,
    username: user.username,
    profilePicture: user.profilePicture,
    bio: user.bio,
    website: user.website,

    postCount: posts.length,
    followers: user.followers.length,
    following: user.following.length,

    posts: posts
}

});

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
// Update User Profile
export const updateProfile = async (req, res) => {
  try {

    const { bio, website } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    user.bio = bio || user.bio;
    user.website = website || user.website;


    await user.save();


    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        bio: user.bio,
        website: user.website,
        profilePicture: user.profilePicture,
      },
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};