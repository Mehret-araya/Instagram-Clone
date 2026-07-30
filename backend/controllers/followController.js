import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Follow User
export const followUser = async (req, res) => {
  try {

    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent following yourself
    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    // Check if already following
    if (userToFollow.followers.includes(req.user._id)) {
      return res.status(400).json({
        message: "Already following this user",
      });
    }

    // Add follower
    userToFollow.followers.push(req.user._id);

    // Add following
    const currentUser = await User.findById(req.user._id);
    currentUser.following.push(userToFollow._id);

    await userToFollow.save();
    await currentUser.save();
// Create follow notification

await Notification.create({

    receiver: userToFollow._id,

    sender: req.user._id,

    type:"follow",

    message:"Someone started following you"

});
    res.status(200).json({
      message: "User followed successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// Unfollow User
export const unfollowUser = async (req, res) => {
  try {

    const userToUnfollow = await User.findById(req.params.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentUser = await User.findById(req.user._id);

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.status(200).json({
      message: "User unfollowed successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};