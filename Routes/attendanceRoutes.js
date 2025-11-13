import express from "express";
import {
  markAttendance,
  getAttendanceByClassAndDate,
  getAttendanceByClass,
  getAttendanceByStudent,
  deleteAttendance,
  getAttendanceStats,
} from "../Controllers/attendanceController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

export const attendanceRoutes = express.Router();

// Mark or update attendance
attendanceRoutes.post("/", authenticateToken, admin, markAttendance);

// Get attendance by class and date
attendanceRoutes.get(
  "/class/date",
  authenticateToken,
  admin,
  getAttendanceByClassAndDate
);

// Get attendance by class (with optional date range)
attendanceRoutes.get("/class", authenticateToken, admin, getAttendanceByClass);

// Get attendance by student
attendanceRoutes.get(
  "/student",
  authenticateToken,
  admin,
  getAttendanceByStudent
);

// Get attendance statistics
attendanceRoutes.get("/stats", authenticateToken, admin, getAttendanceStats);

// Delete attendance record
attendanceRoutes.delete("/:id", authenticateToken, admin, deleteAttendance);
