import "dotenv/config";

import http from "http";
import { initSocket } from "./socket/socket.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import exploreRoutes from "./routes/exploreRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import savedRoutes from "./routes/savedRoutes.js";

const app = express();


// Database
connectDB();


// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/saved", savedRoutes);
app.use(
    "/api/messages",
    messageRoutes
);
app.use(
    "/api/notifications",
    notificationRoutes
);

// Test Route
app.get("/", (req, res) => {
    res.send("Instagram API Running");
});
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;


const server = http.createServer(app);


initSocket(server);


server.listen(PORT, ()=>{

    console.log(
        `Server running on port ${PORT}`
    );

});