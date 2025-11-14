import express from "express";
import quizController from "../Controllers/quizController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Create quiz (admin only)
router.post("/", authenticateToken, admin, quizController.createQuiz);

// Get all quizzes with filters
router.get("/", authenticateToken, quizController.getAllQuizzes);

// Get upcoming quizzes
router.get("/upcoming", authenticateToken, quizController.getUpcomingQuizzes);

// Get quizzes by class
router.get("/class/:class_id", authenticateToken, quizController.getQuizzesByClass);

// Get quiz by ID
router.get("/:id", authenticateToken, quizController.getQuizById);

// Update quiz (admin only)
router.put("/:id", authenticateToken, admin, quizController.updateQuiz);

// Delete quiz (admin only)
router.delete("/:id", authenticateToken, admin, quizController.deleteQuiz);

// Update quiz status (admin only)
router.patch("/:id/status", authenticateToken, admin, quizController.updateQuizStatus);

// Toggle active status (admin only)
router.patch("/:id/toggle-active", authenticateToken, admin, quizController.toggleActiveStatus);

export const quizRoutes = router;
