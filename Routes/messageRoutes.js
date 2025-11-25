import express from "express";
import * as message from "../Controllers/messageController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const messageRoutes = express.Router();

// Create Message
messageRoutes.post("/", authenticateToken, admin, message.createMessage);

// Send Message Now
messageRoutes.post("/:id/send", authenticateToken, admin, message.sendMessageNow);

// Get All Messages
messageRoutes.get("/", authenticateToken, admin, message.getAllMessages);

// Get Student Announcements (public messages for students)
messageRoutes.get("/announcements", authenticateToken, message.getStudentAnnouncements);

// Get Message Statistics
messageRoutes.get("/statistics", authenticateToken, admin, message.getMessageStatistics);

// Get Message by ID
messageRoutes.get("/:id", authenticateToken, admin, message.getMessageById);

// Update Message
messageRoutes.put("/:id", authenticateToken, admin, message.updateMessage);

// Delete Message
messageRoutes.delete("/:id", authenticateToken, admin, message.deleteMessage);

export default messageRoutes;
