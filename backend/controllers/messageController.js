
import Message from "../models/Message.js";
import User from "../models/User.js";

// Send Message
export const sendMessage = async (req, res, next) => {
  try {
    const { receiver, text } = req.body;

    // Validate receiver ID
    if (
      typeof receiver !== "string" ||
      !/^[a-f\d]{24}$/i.test(receiver)
    ) {
      return res.status(400).json({
        message: "A valid receiver ID is required",
      });
    }

    // Normalize receiver ID
    const receiverId = receiver.toLowerCase();

    // Validate message text
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Message text is required",
      });
    }

    const trimmedText = text.trim();

    // Limit message length
    if (trimmedText.length > 1000) {
      return res.status(400).json({
        message: "Message cannot exceed 1000 characters",
      });
    }

    // Prevent sending messages to yourself
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot send a message to yourself",
      });
    }

    // Check that the recipient exists
    const recipient = await User.findById(receiverId);

    if (!recipient) {
      return res.status(404).json({
        message: "Message recipient not found",
      });
    }

    // Create message using the authenticated user's ID
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: trimmedText,
    });

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    next(error);
  }
};

// Get Conversation
export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate conversation user ID
    if (
      typeof userId !== "string" ||
      !/^[a-f\d]{24}$/i.test(userId)
    ) {
      return res.status(400).json({
        message: "A valid conversation user ID is required",
      });
    }

    // Normalize conversation user ID
    const conversationUserId = userId.toLowerCase();

    // Prevent requesting a conversation with yourself
    if (conversationUserId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot open a conversation with yourself",
      });
    }

    // Check that the other user exists
    const otherUser = await User.findById(conversationUserId);

    if (!otherUser) {
      return res.status(404).json({
        message: "Conversation user not found",
      });
    }

    // Retrieve only messages between the authenticated user
    // and the requested conversation user
    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
          receiver: conversationUserId,
        },
        {
          sender: conversationUserId,
          receiver: req.user._id,
        },
      ],
    }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    next(error);
  }
};
