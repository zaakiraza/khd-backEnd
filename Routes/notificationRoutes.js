import express from "express";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";
import {
  sendAssignmentReminders,
  sendExamNotifications,
  sendWelcomeEmail,
  sendAnnouncementEmail
} from "../Utlis/notificationService.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

const router = express.Router();

// Send assignment reminders manually (admin only)
router.post("/assignment-reminders", authenticateToken, admin, async (req, res) => {
  try {
    await sendAssignmentReminders();
    successHandler(res, 200, "Assignment reminders sent successfully");
  } catch (error) {
    console.error("Error sending assignment reminders:", error);
    errorHandler(res, 500, "Failed to send assignment reminders");
  }
});

// Send exam notifications manually (admin only)
router.post("/exam-notifications", authenticateToken, admin, async (req, res) => {
  try {
    await sendExamNotifications();
    successHandler(res, 200, "Exam notifications sent successfully");
  } catch (error) {
    console.error("Error sending exam notifications:", error);
    errorHandler(res, 500, "Failed to send exam notifications");
  }
});

// Send welcome email to specific student (admin only)
router.post("/welcome-email/:studentId", authenticateToken, admin, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { className } = req.body;
    
    await sendWelcomeEmail(studentId, className);
    successHandler(res, 200, "Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    errorHandler(res, 500, "Failed to send welcome email");
  }
});

// Send announcement email (admin only)
router.post("/announcement", authenticateToken, admin, async (req, res) => {
  try {
    const { title, content, targetAudience } = req.body;
    
    if (!title || !content) {
      return errorHandler(res, 400, "Title and content are required");
    }
    
    await sendAnnouncementEmail({ title, content, targetAudience });
    successHandler(res, 200, "Announcement emails sent successfully");
  } catch (error) {
    console.error("Error sending announcement emails:", error);
    errorHandler(res, 500, "Failed to send announcement emails");
  }
});

// Test endpoint to check email templates (admin only)
router.get("/test-templates", authenticateToken, admin, async (req, res) => {
  try {
    const { getEmailTemplate } = await import("../Utlis/emailTemplateHelper.js");
    
    const templates = {
      otp: await getEmailTemplate('otp', { name: 'Test User', otp: '1234' }),
      welcome: await getEmailTemplate('welcome', { 
        studentName: 'Test Student', 
        className: 'Test Class',
        loginUrl: 'http://localhost:5173/login'
      }),
      reminder: await getEmailTemplate('reminder', {
        studentName: 'Test Student',
        assignmentTitle: 'Test Assignment',
        subject: 'Mathematics',
        dueDate: '2024-12-02',
        dueTime: '11:59 PM',
        totalMarks: '100',
        timeLeft: '2 days',
        submissionUrl: 'http://localhost:5173/assignments/123'
      })
    };
    
    successHandler(res, 200, "Templates retrieved successfully", templates);
  } catch (error) {
    console.error("Error testing templates:", error);
    errorHandler(res, 500, "Failed to test templates");
  }
});

export default router;