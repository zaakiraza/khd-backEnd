import express from "express";
import examScheduleController from "../Controllers/examScheduleController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Create exam schedule (admin only)
router.post("/", authenticateToken, admin, examScheduleController.createExamSchedule);

// Get all exam schedules with filters
router.get("/", authenticateToken, examScheduleController.getAllExamSchedules);

// Get upcoming exams (next 7 days)
router.get("/upcoming", authenticateToken, examScheduleController.getUpcomingExams);

// Get exams by class
router.get("/class/:class_id", authenticateToken, examScheduleController.getExamsByClass);

// Get exam schedule by ID
router.get("/:id", authenticateToken, examScheduleController.getExamScheduleById);

// Update exam schedule (admin only)
router.put("/:id", authenticateToken, admin, examScheduleController.updateExamSchedule);

// Delete exam schedule (admin only)
router.delete("/:id", authenticateToken, admin, examScheduleController.deleteExamSchedule);

// Update exam status (admin only)
router.patch("/:id/status", authenticateToken, admin, examScheduleController.updateExamStatus);

// Toggle active status (admin only)
router.patch("/:id/toggle-active", authenticateToken, admin, examScheduleController.toggleActiveStatus);

export const examScheduleRoutes = router;
