import Post from "../models/Post.js";


// Get Popular Posts
export const getPopularPosts = async (req, res) => {
  try {

    const posts = await Post.aggregate([
      {
        $addFields: {
          engagement: {
            $add: [
              { $size: "$likes" },
              { $size: "$comments" }
            ]
          }
        }
      },
      {
        $sort: {
          engagement: -1
        }
      },
      {
        $limit: 20
      }
    ]);


    res.status(200).json({
      message: "Popular posts fetched successfully",
      posts
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};