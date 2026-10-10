import { Server } from "socket.io";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

let io;

const onlineUsers = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    });

    // Socket authentication
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

        // User joins
        socket.on("join", () => {
            const userId = socket.user._id.toString();

            onlineUsers.set(userId, socket.id);

            console.log("User online:", userId);

            io.emit("userOnline", { userId });
        });

        // Send real-time message
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

                // Validate recipient ID
                if (
                    typeof receiver !== "string" ||
                    !/^[a-f\d]{24}$/i.test(receiver)
                ) {
                    socket.emit("messageError", {
                        message: "Invalid message recipient",
                    });
                    return;
                }

                // Normalize recipient ID
                const receiverId = receiver.toLowerCase();

                // Validate message text
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

                // Always use the authenticated user's ID
                const sender = socket.user._id;

                // Prevent messaging yourself
                if (receiverId === sender.toString()) {
                    socket.emit("messageError", {
                        message: "You cannot message yourself",
                    });
                    return;
                }

                // Check that the recipient exists
                const recipient = await User.findById(
                    receiverId
                ).select("_id");

                if (!recipient) {
                    socket.emit("messageError", {
                        message: "Message recipient not found",
                    });
                    return;
                }

                // Save the message
                const message = await Message.create({
                    sender,
                    receiver: recipient._id,
                    text: trimmedText,
                });

                // Create notification
                await Notification.create({
                    receiver: recipient._id,
                    sender,
                    type: "message",
                    message: "You received a new message",
                });

                // Deliver to the recipient if online
                const receiverSocket = onlineUsers.get(
                    recipient._id.toString()
                );

                if (receiverSocket) {
                    io.to(receiverSocket).emit(
                        "receiveMessage",
                        message
                    );
                }
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

        // Typing indicator
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

            // Do not send typing events to yourself
            if (normalizedReceiverId === senderId) {
                return;
            }

            const receiverSocket = onlineUsers.get(
                normalizedReceiverId
            );

            if (receiverSocket) {
                io.to(receiverSocket).emit("userTyping", {
                    senderId,
                });
            }
        });

        // Stop typing indicator
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

            // Do not send stop-typing events to yourself
            if (normalizedReceiverId === senderId) {
                return;
            }

            const receiverSocket = onlineUsers.get(
                normalizedReceiverId
            );

            if (receiverSocket) {
                io.to(receiverSocket).emit("userStoppedTyping", {
                    senderId,
                });
            }
        });

        // User disconnects
        socket.on("disconnect", () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);

                    console.log("User offline:", userId);

                    io.emit("userOffline", { userId });
                }
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

export const getOnlineUsers = () => {
    return onlineUsers;
};
