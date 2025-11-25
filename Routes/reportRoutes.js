import express from "express";
import * as reportController from "../Controllers/reportController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// All reports are admin only for now

router.get("/classes", authenticateToken, admin, reportController.getClassReports);
router.get("/students", authenticateToken, admin, reportController.getStudentReports);
router.get("/exams", authenticateToken, admin, reportController.getExamReports);
router.get("/teachers", authenticateToken, admin, reportController.getTeacherReports);

export const reportRoutes = router;
