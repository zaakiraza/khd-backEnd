import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./Utlis/DB.js";
import { authRoutes } from "./Routes/authRoutes.js";
import { sessionRoutes } from "./Routes/sessionRoutes.js";
import { classRoutes } from "./Routes/classRoutes.js";
import { userRoutes } from "./Routes/userRoutes.js";
import { attendanceRoutes } from "./Routes/attendanceRoutes.js";

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

app.listen(process.env.PORT, () => {
  console.log("server started");
});
