
import User from "../models/User.js";
import Post from "../models/Post.js";

// Save Post
export const savePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.savedPosts.some((id) => id.toString() === postId)) {
      return res.status(400).json({
        message: "Post already saved",
      });
    }

    user.savedPosts.push(postId);

    await user.save();

    res.status(200).json({
      message: "Post saved successfully",
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    console.error("SAVE POST ERROR:", error);
    next(error);
  }
};

// Unsave Post
export const unsavePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      !user.savedPosts.some((id) => id.toString() === postId)
    ) {
      return res.status(400).json({
        message: "Post is not saved",
      });
    }

    user.savedPosts = user.savedPosts.filter(
      (id) => id.toString() !== postId
    );

    await user.save();

    res.status(200).json({
      message: "Post unsaved successfully",
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    console.error("UNSAVE POST ERROR:", error);
    next(error);
  }
};
