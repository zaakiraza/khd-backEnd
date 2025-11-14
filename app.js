import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./Utlis/DB.js";
import { authRoutes } from "./Routes/authRoutes.js";
import { sessionRoutes } from "./Routes/sessionRoutes.js";
import { classRoutes } from "./Routes/classRoutes.js";
import { userRoutes } from "./Routes/userRoutes.js";
import { attendanceRoutes } from "./Routes/attendanceRoutes.js";
import { examScheduleRoutes } from "./Routes/examScheduleRoutes.js";
import { assignmentRoutes } from "./Routes/assignmentRoutes.js";
import { quizRoutes } from "./Routes/quizRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/class", classRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exam-schedule", examScheduleRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/quiz", quizRoutes);

app.listen(process.env.PORT, () => {
  console.log("server started");
});
