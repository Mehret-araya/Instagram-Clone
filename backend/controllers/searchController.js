import User from "../models/User.js";
import Post from "../models/Post.js";

// Save Recent Search
export const saveRecentSearch = async (req, res) => {
  try {

    const { search } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message:"User not found"
      });
    }


    // Remove duplicate search
    user.recentSearches =
      user.recentSearches.filter(
        item => item !== search
      );


    // Add new search at beginning
    user.recentSearches.unshift(search);


    // Keep only last 10 searches
    user.recentSearches =
      user.recentSearches.slice(0,10);


    await user.save();


    res.status(200).json({
      message:"Search saved successfully",
      recentSearches:user.recentSearches
    });


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};
// Get Recent Searches
export const getRecentSearches = async (req,res)=>{
  try{

    const user = await User.findById(req.user._id)
      .select("recentSearches");


    res.status(200).json({
      recentSearches:user.recentSearches
    });


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};

// Search Users
export const searchUsers = async (req, res) => {
  try {

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const users = await User.find({
      username: {
        $regex: q,
        $options: "i",
      },
    }).select("-password");


    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Search Hashtags
export const searchHashtags = async (req, res) => {
  try {

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }


    const posts = await Post.find({
      hashtags:{
        $regex:q,
        $options:"i"
      }
    })
    .populate("user","username profilePicture");


    res.status(200).json({
      message:"Hashtags found successfully",
      count:posts.length,
      posts
    });


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};

// Search Posts
export const searchPosts = async (req, res) => {
  try {

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }


    const posts = await Post.find({
      caption: {
        $regex: q,
        $options: "i",
      },
    })
    .populate("user", "username profilePicture");


    res.status(200).json({
      message: "Posts fetched successfully",
      count: posts.length,
      posts,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};