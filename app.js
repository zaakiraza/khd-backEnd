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
import { assignmentSubmissionRoutes } from "./Routes/assignmentSubmissionRoutes.js";
import { quizRoutes } from "./Routes/quizRoutes.js";
import { quizAttemptRoutes } from "./Routes/quizAttemptRoutes.js";
import emailMatterRoutes from "./Routes/emailMatterRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";
import { lessonPlanRoutes } from "./Routes/lessonPlanRoutes.js";
import { leaveRoutes } from "./Routes/leaveRoutes.js";
import { resultRoutes } from "./Routes/resultRoutes.js";
import { reportRoutes } from "./Routes/reportRoutes.js";
import { newsletterRoutes } from "./Routes/newsletterRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
// Import cron jobs for automated notifications
import "./cronJobs.js";

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
app.use("/api/assignment-submission", assignmentSubmissionRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quiz-attempt", quizAttemptRoutes);
app.use("/api/email-matter", emailMatterRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/lesson-plan", lessonPlanRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(process.env.PORT, () => {
  console.log("server started");
});
