
import mongoose from "mongoose";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

const isValidPostId = (id) => mongoose.isObjectIdOrHexString(id);

const serializeLikes = (likes) => likes.map((like) => like.toString());

// Like Post
export const likePost = async (req, res, next) => {
  try {
    if (!isValidPostId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const userId = req.user._id;
    const update = await Post.updateOne(
      {
        _id: req.params.id,
        likes: { $ne: userId },
      },
      {
        $addToSet: { likes: userId },
      }
    );

    const post = await Post.findById(req.params.id).select("user likes");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (update.modifiedCount > 0 && post.user.toString() !== userId.toString()) {
      await Notification.create({
        receiver: post.user,
        sender: userId,
        type: "like",
        post: post._id,
        message: "Someone liked your post",
      });
    }

    res.status(200).json({
      message: update.modifiedCount > 0
        ? "Post liked successfully"
        : "Post already liked",
      liked: true,
      likes: serializeLikes(post.likes),
    });
  } catch (error) {
    next(error);
  }
};


// Unlike Post
export const unlikePost = async (req, res, next) => {
  try {
    if (!isValidPostId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    await Post.updateOne(
      {
        _id: req.params.id,
        likes: req.user._id,
      },
      {
        $pull: { likes: req.user._id },
      }
    );

    const post = await Post.findById(req.params.id).select("likes");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      message: "Post unliked successfully",
      liked: false,
      likes: serializeLikes(post.likes),
    });
  } catch (error) {
    next(error);
  }
};
