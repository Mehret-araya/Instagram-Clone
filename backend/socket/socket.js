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
    methods: [
        "GET",
        "POST"
    ]
}

    });

    // Socket authentication
    io.use(async (socket, next) => {

        try {

            const token =
                socket.handshake.auth?.token;

            if (!token) {

                return next(
                    new Error("Authentication required")
                );

            }

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

            const user =
                await User.findById(
                    decoded.id
                ).select("_id username");

            if (!user) {

                return next(
                    new Error("User not found")
                );

            }

            socket.user = user;

            next();

        } catch (error) {

            next(
                new Error("Invalid or expired token")
            );

        }

    });

    io.on(
        "connection",
        (socket) => {

            console.log(
                "User connected:",
                socket.id
            );


            // User joins
           // User joins
socket.on(
    "join",
    () => {

        const userId =
            socket.user._id.toString();

        onlineUsers.set(
            userId,
            socket.id
        );

        console.log(
            "User online:",
            userId
        );

        // Notify everyone
        io.emit(
            "userOnline",
            {
                userId
            }
        );

    }
);


// Send real-time message
socket.on(
    "sendMessage",
    async (data) => {

        try {

            const {
                receiver,
                text
            } = data;

            const sender =
                socket.user._id;

            // Save message
            const message =
                await Message.create({

                    sender,

                    receiver,

                    text

                });

            await Notification.create({

                receiver,

                sender,

                type: "message",

                message:
                    "You received a new message"

            });

            // Find receiver socket
            const receiverSocket =
                onlineUsers.get(
                    receiver.toString()
                );

            // Send instantly
            if (receiverSocket) {

                io.to(receiverSocket)
                    .emit(
                        "receiveMessage",
                        message
                    );

            }

        } catch (error) {

            console.log(
                error.message
            );

        }

    }
);

            // Typing indicator

                    // Typing indicator
socket.on(
    "typing",
    (data) => {

        const senderId =
            socket.user._id.toString();

        const receiverSocket =
            onlineUsers.get(
                data.receiverId.toString()
            );

        if (receiverSocket) {

            io.to(receiverSocket)
                .emit(
                    "userTyping",
                    {
                        senderId
                    }
                );

        }

    }
);
            // Stop typing indicator

// Stop typing indicator
socket.on(
    "stopTyping",
    (data) => {

        const senderId =
            socket.user._id.toString();

        const receiverSocket =
            onlineUsers.get(
                data.receiverId.toString()
            );

        if (receiverSocket) {

            io.to(receiverSocket)
                .emit(
                    "userStoppedTyping",
                    {
                        senderId
                    }
                );

        }

    }
);
            // User disconnects
            socket.on(
                "disconnect",
                () => {

                    for (
                        let [userId, socketId]
                        of onlineUsers.entries()
                    ) {

                        if (socketId === socket.id) {

                            onlineUsers.delete(
                                userId
                            );

                            console.log(
                                "User offline:",
                                userId
                            );

                            // Notify everyone
                            io.emit(
                                "userOffline",
                                {
                                    userId
                                }
                            );

                        }

                    }

                }
            );

        }
    );

    return io;

};

export const getIO = () => {

    if (!io) {

        throw new Error(
            "Socket.IO not initialized"
        );

    }

    return io;

};

export const getOnlineUsers = () => {

    return onlineUsers;

};
