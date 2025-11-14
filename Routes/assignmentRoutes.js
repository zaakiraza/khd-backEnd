import express from "express";
import assignmentController from "../Controllers/assignmentController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Create assignment (admin only)
router.post("/", authenticateToken, admin, assignmentController.createAssignment);

// Get all assignments with filters
router.get("/", authenticateToken, assignmentController.getAllAssignments);

// Get current week assignments
router.get("/current-week", authenticateToken, admin, assignmentController.getCurrentWeekAssignments);

// Get missing assignments (for reminder)
router.get("/missing", authenticateToken, admin, assignmentController.getMissingAssignments);

// Get assignments by class
router.get("/class/:class_id", authenticateToken, assignmentController.getAssignmentsByClass);

// Get assignment by ID
router.get("/:id", authenticateToken, assignmentController.getAssignmentById);

// Update assignment (admin only)
router.put("/:id", authenticateToken, admin, assignmentController.updateAssignment);

// Delete assignment (admin only)
router.delete("/:id", authenticateToken, admin, assignmentController.deleteAssignment);

// Update assignment status (admin only)
router.patch("/:id/status", authenticateToken, admin, assignmentController.updateAssignmentStatus);

// Toggle active status (admin only)
router.patch("/:id/toggle-active", authenticateToken, admin, assignmentController.toggleActiveStatus);

export const assignmentRoutes = router;
