
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// Like Post
export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const currentUserId = req.user._id.toString();

    // Check if user already liked
    if (
      post.likes.some(
        (like) => like.toString() === currentUserId
      )
    ) {
      return res.status(400).json({
        message: "Post already liked",
      });
    }

    post.likes.push(req.user._id);

    await post.save();

    // Create like notification
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        receiver: post.user,
        sender: req.user._id,
        type: "like",
        post: post._id,
        message: "Someone liked your post",
      });
    }

    res.status(200).json({
      message: "Post liked successfully",
      likes: post.likes.length,
    });

  } catch (error) {

    next(error);

  }
};


// Unlike Post
export const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const currentUserId = req.user._id.toString();

    // Check if user has liked the post
    if (
      !post.likes.some(
        (like) => like.toString() === currentUserId
      )
    ) {
      return res.status(400).json({
        message: "You have not liked this post",
      });
    }

    // Remove the user's like
    post.likes = post.likes.filter(
      (like) => like.toString() !== currentUserId
    );

    await post.save();

    res.status(200).json({
      message: "Post unliked successfully",
      likes: post.likes.length,
    });

  } catch (error) {

    next(error);

  }
};
