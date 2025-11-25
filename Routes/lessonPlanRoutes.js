import express from "express";
import * as lessonPlanController from "../Controllers/lessonPlanController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Create Lesson Plan (Admin only)
router.post("/", authenticateToken, admin, lessonPlanController.createLessonPlan);

// Get All Lesson Plans
router.get("/", authenticateToken, lessonPlanController.getAllLessonPlans);

// Get Lesson Plan by ID
router.get("/:id", authenticateToken, lessonPlanController.getLessonPlanById);

// Update Lesson Plan (Admin only)
router.put("/:id", authenticateToken, admin, lessonPlanController.updateLessonPlan);

// Delete Lesson Plan (Admin only)
router.delete("/:id", authenticateToken, admin, lessonPlanController.deleteLessonPlan);

export const lessonPlanRoutes = router;
