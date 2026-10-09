
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Follow User
export const followUser = async (req, res, next) => {
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

    // Find the authenticated user
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    // Check if already following
    const alreadyFollowing = userToFollow.followers.some(
      (id) => id.toString() === currentUser._id.toString()
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "Already following this user",
      });
    }

    // Add follower and following relationships
    userToFollow.followers.push(currentUser._id);
    currentUser.following.push(userToFollow._id);

    await userToFollow.save();
    await currentUser.save();

    // Create follow notification
    await Notification.create({
      receiver: userToFollow._id,
      sender: currentUser._id,
      type: "follow",
      message: "Someone started following you",
    });

    res.status(200).json({
      message: "User followed successfully",
    });
  } catch (error) {
    console.error("FOLLOW USER ERROR:", error);
    next(error);
  }
};

// Unfollow User
export const unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    // Remove the follower relationship
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    // Remove the following relationship
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.status(200).json({
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error("UNFOLLOW USER ERROR:", error);
    next(error);
  }
};
