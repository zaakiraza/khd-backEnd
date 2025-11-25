import express from "express";
import * as leaveController from "../Controllers/leaveController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Apply for Leave
router.post("/", authenticateToken, leaveController.applyLeave);

// Get My Leaves
router.get("/my-leaves", authenticateToken, leaveController.getMyLeaves);

// Get All Leaves (Admin only)
router.get("/", authenticateToken, admin, leaveController.getAllLeaves);

// Update Leave Status (Admin only)
router.patch("/:id/status", authenticateToken, admin, leaveController.updateLeaveStatus);

// Delete Leave
router.delete("/:id", authenticateToken, leaveController.deleteLeave);

export const leaveRoutes = router;
