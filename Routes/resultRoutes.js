import express from "express";
import * as resultController from "../Controllers/resultController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Add Result (Admin only)
router.post("/", authenticateToken, admin, resultController.addResult);

// Get Results by Exam (Admin only)
router.get("/exam/:exam_id", authenticateToken, admin, resultController.getResultsByExam);

// Get Results by Student
router.get("/student/:student_id", authenticateToken, resultController.getResultsByStudent);

// Update Result (Admin only)
router.put("/:id", authenticateToken, admin, resultController.updateResult);

// Publish Results (Admin only)
router.post("/publish", authenticateToken, admin, resultController.publishResults);

// Delete Result (Admin only)
router.delete("/:id", authenticateToken, admin, resultController.deleteResult);

export const resultRoutes = router;
