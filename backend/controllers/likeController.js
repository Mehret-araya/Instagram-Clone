import Post from "../models/Post.js";

// Like Post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if user already liked
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({
        message: "Post already liked",
      });
    }

    post.likes.push(req.user._id);

    await post.save();

    res.status(200).json({
      message: "Post liked successfully",
      likes: post.likes.length,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// Unlike Post
export const unlikePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if user has liked the post
    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({
        message: "You have not liked this post",
      });
    }

    // Remove the user's like
    post.likes = post.likes.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await post.save();

    res.status(200).json({
      message: "Post unliked successfully",
      likes: post.likes.length,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};