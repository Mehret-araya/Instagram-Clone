import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// ========================================
// ADD COMMENT
// ========================================
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
      replies: [],
    });

    await post.save();

    // Create notification for post owner
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        receiver: post.user,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        message: "Someone commented on your post",
      });
    }

    res.status(201).json({
      message: "Comment added successfully",
      comments: post.comments,
    });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// DELETE COMMENT
// ========================================
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Only the comment owner can delete it
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    comment.deleteOne();

    await post.save();

    res.status(200).json({
      message: "Comment deleted successfully",
      comments: post.comments,
    });
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// ADD REPLY
// ========================================
export const addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Reply text is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Add reply
    comment.replies.push({
      user: req.user._id,
      text: text.trim(),
    });

    await post.save();

    // Create notification for comment owner
    if (comment.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        receiver: comment.user,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        message: "Someone replied to your comment",
      });
    }

    res.status(201).json({
      message: "Reply added successfully",
      replies: comment.replies,
    });
  } catch (error) {
    console.error("ADD REPLY ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

