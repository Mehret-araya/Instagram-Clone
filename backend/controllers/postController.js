import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";

// Create Post
export const createPost = async (req, res, next) => {
  try {

    console.log("========== CREATE POST REQUEST ==========");
    console.log("User:", req.user);
    console.log("Body:", req.body);
    console.log("File:", req.file);


    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }


    // Check image upload
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
      });
    }


    const { caption, hashtags } = req.body;


    let hashtagArray = [];

    if (hashtags) {

      if (Array.isArray(hashtags)) {
        hashtagArray = hashtags;
      }
      else {
        hashtagArray = hashtags
          .split(",")
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }

    }


    // Support both middleware styles
    const userId = req.user._id || req.user.id;


    if (!userId) {
      return res.status(400).json({
        message: "User ID missing from authentication",
      });
    }


    const post = await Post.create({

      user: userId,

      image: {
        url: req.file.path,
        public_id: req.file.filename,
      },

      caption,

      hashtags: hashtagArray,

    });


    console.log("========== POST CREATED ==========");
    console.log(post);


    res.status(201).json({

      message: "Post created successfully",

      post,

    });


  } catch (error) {

    console.error("========== CREATE POST ERROR ==========");
    console.error(error);

    next(error);

  }
};




// Get All Posts
export const getAllPosts = async (req, res, next) => {
  try {

    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });


    res.status(200).json(posts);

  }

  catch (error) {

    console.error("GET POSTS ERROR:", error);

    next(error);

  }
};



// Get Single Post
export const getPostById = async (req, res, next) => {
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

    next(error);

  }
};


// Update Post
export const updatePost = async (req, res, next) => {
  try {
    const { caption, hashtags } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Only the owner can update the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot update this post",
      });
    }

    // Update caption
    if (caption !== undefined) {
      post.caption = caption;
    }

    // Update hashtags
    if (hashtags !== undefined) {
      post.hashtags = hashtags;
    }

    await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {

    next(error);

  }
};


// Delete Post
export const deletePost = async (req, res, next) => {
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

    next(error);

  }
};