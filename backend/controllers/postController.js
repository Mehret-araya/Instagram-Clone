import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";


// Create Post
export const createPost = async (req, res) => {
  try {

    const { caption, hashtags } = req.body;

    console.log("File received:", req.file);
    console.log("Body received:", req.body);


    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
      });
    }


    const post = await Post.create({
      user: req.user._id,

      image: {
        url: req.file.path,
        public_id: req.file.filename,
      },

      caption,
       hashtags
    });


    res.status(201).json({
      message: "Post created successfully",
      post,
    });


  } catch (error) {

    console.error("Create Post Error:", error);

    res.status(500).json({
      message: error.message,
    });

  }
};



// Get All Posts
export const getAllPosts = async (req, res) => {
  try {

    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });


    res.status(200).json(posts);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// Get Single Post
export const getPostById = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePicture");


    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }


    res.status(200).json(post);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// Update Post
export const updatePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);


    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }


    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot update this post",
      });
    }


    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        caption: req.body.caption,
      },
      {
        new: true,
      }
    );


    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// Delete Post
export const deletePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);


    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }


    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot delete this post",
      });
    }


    // Delete image from Cloudinary
    if (post.image?.public_id) {

      await cloudinary.uploader.destroy(
        post.image.public_id
      );

    }


    await Post.findByIdAndDelete(req.params.id);


    res.status(200).json({
      message: "Post deleted successfully",
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};