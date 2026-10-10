import { Server } from "socket.io";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    });

    // Authenticate every Socket.IO connection.
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            if (!process.env.JWT_SECRET) {
                return next(
                    new Error("Server authentication is not configured")
                );
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            if (!decoded || !decoded.id) {
                return next(new Error("Invalid authentication token"));
            }

            const user = await User.findById(
                decoded.id
            ).select("_id username");

            if (!user) {
                return next(new Error("User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Join the authenticated user's personal room.
        socket.on("join", async () => {
            try {
                const userId = socket.user._id.toString();

                const existingSockets = await io
                    .in(userId)
                    .fetchSockets();

                const wasOnline = existingSockets.length > 0;

                await socket.join(userId);

                console.log("User joined personal room:", userId);

                if (!wasOnline) {
                    io.emit("userOnline", { userId });
                }
            } catch (error) {
                console.error("SOCKET JOIN ERROR:", error.message);
            }
        });

        // Send a real-time message.
        socket.on("sendMessage", async (data) => {
            try {
                if (
                    !data ||
                    typeof data !== "object" ||
                    Array.isArray(data)
                ) {
                    socket.emit("messageError", {
                        message: "Invalid message data",
                    });
                    return;
                }

                const { receiver, text } = data;

                if (
                    typeof receiver !== "string" ||
                    !/^[a-f\d]{24}$/i.test(receiver)
                ) {
                    socket.emit("messageError", {
                        message: "Invalid message recipient",
                    });
                    return;
                }

                const receiverId = receiver.toLowerCase();

                if (
                    typeof text !== "string" ||
                    !text.trim()
                ) {
                    socket.emit("messageError", {
                        message: "Message text is required",
                    });
                    return;
                }

                const trimmedText = text.trim();

                if (trimmedText.length > 1000) {
                    socket.emit("messageError", {
                        message: "Message cannot exceed 1000 characters",
                    });
                    return;
                }

                // The sender is always taken from the authenticated socket.
                const sender = socket.user._id;

                if (receiverId === sender.toString()) {
                    socket.emit("messageError", {
                        message: "You cannot message yourself",
                    });
                    return;
                }

                const recipient = await User.findById(
                    receiverId
                ).select("_id");

                if (!recipient) {
                    socket.emit("messageError", {
                        message: "Message recipient not found",
                    });
                    return;
                }

                // Save the message.
                const message = await Message.create({
                    sender,
                    receiver: recipient._id,
                    text: trimmedText,
                });

                // Create the existing message notification.
                await Notification.create({
                    receiver: recipient._id,
                    sender,
                    type: "message",
                    message: "You received a new message",
                });

                // Deliver to every active tab in the recipient's room.
                io.to(recipient._id.toString()).emit(
                    "receiveMessage",
                    message
                );
            } catch (error) {
                console.error(
                    "SOCKET SEND MESSAGE ERROR:",
                    error.message
                );

                socket.emit("messageError", {
                    message: "Unable to send message. Please try again.",
                });
            }
        });

        // Notify all recipient tabs when the sender is typing.
        socket.on("typing", (data) => {
            const receiverId = data?.receiverId;

            if (
                typeof receiverId !== "string" ||
                !/^[a-f\d]{24}$/i.test(receiverId)
            ) {
                return;
            }

            const normalizedReceiverId = receiverId.toLowerCase();
            const senderId = socket.user._id.toString();

            if (normalizedReceiverId === senderId) {
                return;
            }

            socket.to(normalizedReceiverId).emit("userTyping", {
                senderId,
            });
        });

        // Notify all recipient tabs when typing stops.
        socket.on("stopTyping", (data) => {
            const receiverId = data?.receiverId;

            if (
                typeof receiverId !== "string" ||
                !/^[a-f\d]{24}$/i.test(receiverId)
            ) {
                return;
            }

            const normalizedReceiverId = receiverId.toLowerCase();
            const senderId = socket.user._id.toString();

            if (normalizedReceiverId === senderId) {
                return;
            }

            socket.to(normalizedReceiverId).emit("userStoppedTyping", {
                senderId,
            });
        });

        // Mark the user offline only after their last connection disconnects.
        socket.on("disconnect", async () => {
            try {
                const userId = socket.user._id.toString();

                // Socket.IO removes the disconnecting socket from its rooms.
                const remainingSockets = await io
                    .in(userId)
                    .fetchSockets();

                if (remainingSockets.length === 0) {
                    console.log("User offline:", userId);
                    io.emit("userOffline", { userId });
                }
            } catch (error) {
                console.error(
                    "SOCKET DISCONNECT ERROR:",
                    error.message
                );
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }

    return io;
};
