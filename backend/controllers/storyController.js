import Story from "../models/Story.js";


// Create Story
export const createStory = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image"
      });
    }


    const story = await Story.create({

      user: req.user._id,

      image: {
        url: req.file.path,
        public_id: req.file.filename
      },

      expiresAt: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      )

    });


    res.status(201).json({
      message: "Story created successfully",
      story
    });


  } catch(error){

    res.status(500).json({
      message: error.message
    });

  }
};
// View Story
export const viewStory = async (req, res) => {
  try {

    const story = await Story.findById(req.params.id);


    if (!story) {
      return res.status(404).json({
        message: "Story not found"
      });
    }


    // Check if already viewed

    if (!story.viewers.includes(req.user._id)) {

      story.viewers.push(req.user._id);

      await story.save();

    }


    res.status(200).json({
      message: "Story viewed successfully",
      views: story.viewers.length
    });


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};


// Get Active Stories
export const getStories = async (req, res) => {
  try {

    const stories = await Story.find({
      expiresAt: {
        $gt: new Date()
      }
    })
    .populate(
      "user",
      "username profilePicture"
    )
    .sort({
      createdAt: -1
    });


    res.status(200).json({
      message: "Stories fetched successfully",
      count: stories.length,
      stories
    });


  } catch(error){

    res.status(500).json({
      message: error.message
    });

  }
};