import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    sendMessage,
    getMessages
} from "../controllers/messageController.js";


const router = express.Router();



// Send message
router.post(
    "/",
    authMiddleware,
    sendMessage
);



// Get conversation
router.get(
    "/:userId",
    authMiddleware,
    getMessages
);


export default router;