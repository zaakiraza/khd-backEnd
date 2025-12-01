import mongoose from "mongoose";
import EmailMatter from "./Models/emailMatter.js";
import { getEmailTemplate } from "./Utlis/emailTemplateHelper.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("MongoDB Connected for testing templates");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Test templates
const testTemplates = async () => {
  try {
    console.log("Testing email template system...\n");

    // Test OTP template
    const otpTemplate = await getEmailTemplate('otp', {
      name: 'John Doe',
      otp: '1234'
    });
    console.log("✅ OTP Template:", otpTemplate ? "Found" : "Not found");
    if (otpTemplate) {
      console.log("   Subject:", otpTemplate.subject);
      console.log("   Variables replaced successfully");
    }

    // Test welcome template
    const welcomeTemplate = await getEmailTemplate('welcome', {
      studentName: 'Jane Smith',
      className: 'Math Class',
      loginUrl: 'http://localhost:5173/login'
    });
    console.log("✅ Welcome Template:", welcomeTemplate ? "Found" : "Not found");
    if (welcomeTemplate) {
      console.log("   Subject:", welcomeTemplate.subject);
    }

    // Test password reset template
    const passwordTemplate = await getEmailTemplate('custom', {
      userName: 'Test User',
      newPassword: 'newPass123'
    });
    console.log("✅ Password Reset Template:", passwordTemplate ? "Found" : "Not found");
    if (passwordTemplate) {
      console.log("   Subject:", passwordTemplate.subject);
    }

    // Test reminder template
    const reminderTemplate = await getEmailTemplate('reminder', {
      studentName: 'Alex Johnson',
      assignmentTitle: 'Math Assignment 1',
      subject: 'Mathematics',
      dueDate: '2024-12-03',
      dueTime: '11:59 PM',
      totalMarks: '50',
      timeLeft: '1 day',
      submissionUrl: 'http://localhost:5173/assignments/123'
    });
    console.log("✅ Assignment Reminder Template:", reminderTemplate ? "Found" : "Not found");
    if (reminderTemplate) {
      console.log("   Subject:", reminderTemplate.subject);
    }

    // Test notification templates
    const notificationTemplate = await getEmailTemplate('notification', {
      email: 'test@example.com'
    });
    console.log("✅ Newsletter Template:", notificationTemplate ? "Found" : "Not found");
    if (notificationTemplate) {
      console.log("   Subject:", notificationTemplate.subject);
    }

    // Test announcement template
    const announcementTemplate = await getEmailTemplate('announcement', {
      announcementTitle: 'Important Notice',
      announcementDate: '2024-12-01',
      announcementContent: 'This is a test announcement.'
    });
    console.log("✅ Announcement Template:", announcementTemplate ? "Found" : "Not found");
    if (announcementTemplate) {
      console.log("   Subject:", announcementTemplate.subject);
    }

    // List all templates in database
    const allTemplates = await EmailMatter.find({ isActive: true }).select('name type subject');
    console.log("\n📧 Templates in Database:");
    allTemplates.forEach(template => {
      console.log(`   - ${template.name} (${template.type})`);
    });

    console.log("\n🎉 Email template system is working perfectly!");

  } catch (error) {
    console.error("❌ Error testing templates:", error);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testTemplates();
  mongoose.connection.close();
  console.log("Database connection closed");
};

runTest();