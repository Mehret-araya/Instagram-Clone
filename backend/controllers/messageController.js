
import Message from "../models/Message.js";
import User from "../models/User.js";

// Send Message
export const sendMessage = async (req, res, next) => {
  try {
    const { receiver, text } = req.body;

    if (!receiver || !text || !text.trim()) {
      return res.status(400).json({
        message: "Receiver and message text are required",
      });
    }

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot send a message to yourself",
      });
    }

    const recipient = await User.findById(receiver);

    if (!recipient) {
      return res.status(404).json({
        message: "Message recipient not found",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      text: text.trim(),
    });

    res.status(201).json({
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

    const otherUser = await User.findById(userId);

    if (!otherUser) {
      return res.status(404).json({
        message: "Conversation user not found",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: req.user._id,
        },
      ],
    }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    next(error);
  }
};
