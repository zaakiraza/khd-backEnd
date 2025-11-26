import express from "express";
import submissionController from "../Controllers/assignmentSubmissionController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Submit assignment (student)
router.post("/", authenticateToken, submissionController.submitAssignment);

// Get my submissions (student)
router.get("/my-submissions", authenticateToken, submissionController.getMySubmissions);

// Get my submission for specific assignment (student)
router.get("/assignment/:assignment_id", authenticateToken, submissionController.getMySubmission);

// Get all submissions for an assignment (admin)
router.get("/assignment/:assignment_id/all", authenticateToken, admin, submissionController.getAssignmentSubmissions);

// Grade submission (admin)
router.put("/:id/grade", authenticateToken, admin, submissionController.gradeSubmission);

export const assignmentSubmissionRoutes = router;
