
import mongoose from "mongoose";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

const isValidObjectId = (id) => mongoose.isObjectIdOrHexString(id);

// ========================================
// ADD COMMENT
// ========================================
export const addComment = async (req, res, next) => {
  try {
    const text = req.body?.text;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post ID",
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
    await post.populate("comments.user", "username profilePicture");

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
    next(error);
  }
};


// ========================================
// DELETE COMMENT
// ========================================
export const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid post or comment ID",
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

    if (comment.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    const update = await Post.updateOne(
      {
        _id: postId,
        comments: {
          $elemMatch: {
            _id: commentId,
            user: req.user._id,
          },
        },
      },
      {
        $pull: {
          comments: {
            _id: commentId,
            user: req.user._id,
          },
        },
      }
    );

    if (update.modifiedCount === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const updatedPost = await Post.findById(postId).populate(
      "comments.user",
      "username profilePicture"
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      message: "Comment deleted successfully",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);
    next(error);
  }
};


// ========================================
// ADD REPLY
// ========================================
export const addReply = async (req, res, next) => {

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

    next(error);

  }
};
