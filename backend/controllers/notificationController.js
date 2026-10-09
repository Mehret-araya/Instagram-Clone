
import Notification from "../models/Notification.js";

// Get User Notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user._id,
    })
      .populate("sender", "username profilePicture")
      .populate("post")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    next(error);
  }
};

// Mark Notification as Read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Only the receiver can mark it as read
    if (
      notification.receiver.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot update this notification",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION AS READ ERROR:", error);
    next(error);
  }
};

