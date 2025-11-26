import express from "express";
import attemptController from "../Controllers/quizAttemptController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Start quiz attempt (student)
router.post("/start", authenticateToken, attemptController.startQuizAttempt);

// Submit quiz attempt (student)
router.post("/submit", authenticateToken, attemptController.submitQuizAttempt);

// Get my attempts (student)
router.get("/my-attempts", authenticateToken, attemptController.getMyAttempts);

// Get my attempt for specific quiz (student)
router.get("/quiz/:quiz_id", authenticateToken, attemptController.getMyAttempt);

// Get all attempts for a quiz (admin)
router.get("/quiz/:quiz_id/all", authenticateToken, admin, attemptController.getQuizAttempts);

// Grade attempt (admin)
router.put("/:id/grade", authenticateToken, admin, attemptController.gradeAttempt);

export const quizAttemptRoutes = router;
