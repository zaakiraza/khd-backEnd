import mongoose from "mongoose";
import EmailMatter from "./Models/emailMatter.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("MongoDB Connected for seeding templates");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Email templates with proper HTML content
const emailTemplates = [
  {
    name: "OTP Verification Email",
    subject: "Account Verification - OTP Code",
    type: "otp",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Verification - OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔐 Account Verification</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Khuddam Learning Online Classes</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #f0f9ff; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">🔑</span>
        </div>
        <h2 style="color: #293c5d; margin: 0; font-size: 24px;">Your Verification Code</h2>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px; text-align: center;">
        Dear <strong>{{name}}</strong>,<br><br>
        Thank you for registering with Khuddam Learning Online Classes. Your registration is successful! 
        Please use the verification code below to complete your account setup.
      </p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #293c5d; border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your OTP Code</p>
        <div style="background: #293c5d; color: white; font-size: 36px; font-weight: bold; padding: 15px 25px; border-radius: 10px; display: inline-block; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          {{otp}}
        </div>
        <p style="margin: 15px 0 0 0; color: #ef4444; font-size: 14px; font-weight: 600;">
          ⏱️ This code expires in 1 minute
        </p>
      </div>
      
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📋 Instructions:</h3>
        <ol style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Enter this code in the verification form</li>
          <li>Code is valid for 1 minute only</li>
          <li>Do not share this code with anyone</li>
          <li>If code expires, request a new one</li>
        </ol>
      </div>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="color: #dc2626; margin: 0; font-size: 14px; text-align: center;">
          🔒 <strong>Security Notice:</strong> If you didn't register for this account, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
          Need help? Contact our support team at 
          <a href="mailto:support@khuddamlearning.com" style="color: #293c5d;">support@khuddamlearning.com</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 Khuddam Learning. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    variables: [
      { key: "name", description: "User's first name" },
      { key: "otp", description: "4-digit OTP code" }
    ],
    isActive: true
  },
  {
    name: "Welcome Email for Students",
    subject: "Welcome to Khuddam Learning - Your Learning Journey Begins!",
    type: "welcome",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Khuddam Learning</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎉 Welcome to Khuddam Learning!</h1>
      <p style="color: #e2e8f0; margin: 15px 0 0 0; font-size: 18px;">Your Learning Journey Begins Here</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #ecfdf5; border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; border: 3px solid #10b981;">
          <span style="font-size: 40px;">🎓</span>
        </div>
        <h2 style="color: #293c5d; margin: 0; font-size: 26px;">Welcome {{studentName}}!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">You've successfully joined <strong>{{className}}</strong></p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 15px; padding: 30px; margin: 30px 0; text-align: center;">
        <h3 style="color: #293c5d; margin: 0 0 20px 0; font-size: 20px;">🚀 Ready to Get Started?</h3>
        <p style="color: #475569; margin: 0 0 25px 0; line-height: 1.6;">
          Your account is now active and ready to use. Access your student dashboard to explore courses, 
          view assignments, check your attendance, and much more!
        </p>
        <a href="{{loginUrl}}" 
           style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
          🔑 Access Dashboard
        </a>
      </div>
      
      <div style="margin: 40px 0;">
        <h3 style="color: #293c5d; text-align: center; margin: 0 0 30px 0; font-size: 22px;">📚 What You Can Do:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
          <div style="background: #fef3c7; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📖</div>
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Study Materials</h4>
            <p style="color: #a16207; margin: 0; font-size: 12px;">Access course content and resources</p>
          </div>
          <div style="background: #dbeafe; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📝</div>
            <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px;">Assignments</h4>
            <p style="color: #2563eb; margin: 0; font-size: 12px;">Submit and track your assignments</p>
          </div>
          <div style="background: #f3e8ff; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
            <h4 style="color: #7c3aed; margin: 0 0 8px 0; font-size: 14px;">Progress Tracking</h4>
            <p style="color: #8b5cf6; margin: 0; font-size: 12px;">Monitor your academic progress</p>
          </div>
          <div style="background: #fce7f3; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">👥</div>
            <h4 style="color: #be185d; margin: 0 0 8px 0; font-size: 14px;">Community</h4>
            <p style="color: #db2777; margin: 0; font-size: 12px;">Connect with classmates and teachers</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
          Welcome to the Khuddam Learning Family! 🏡
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
          © 2024 Khuddam Learning. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    variables: [
      { key: "studentName", description: "Student's full name" },
      { key: "className", description: "Class name the student joined" },
      { key: "loginUrl", description: "URL to student dashboard login" }
    ],
    isActive: true
  },
  {
    name: "Password Reset Email",
    subject: "Password Reset Request - Khuddam Learning",
    type: "custom",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">🔐</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
      <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Khuddam Learning Account Security</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #293c5d; margin: 0; font-size: 22px;">Hello {{userName}},</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">We received a request to reset your password</p>
      </div>
      
      <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">🚨</div>
        <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">Your New Password</h3>
        <div style="background: #dc2626; color: white; font-size: 24px; font-weight: bold; padding: 15px 25px; border-radius: 10px; display: inline-block; letter-spacing: 2px; font-family: 'Courier New', monospace; margin: 10px 0;">
          {{newPassword}}
        </div>
        <p style="color: #991b1b; margin: 10px 0 0 0; font-size: 14px;">
          Please change this password after logging in for security
        </p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
          Use this temporary password to log into your account, then immediately change it to a secure password of your choice.
        </p>
      </div>
      
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">🔒 Password Security Tips:</h3>
        <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.7; font-size: 14px;">
          <li>Use a combination of letters, numbers, and special characters</li>
          <li>Make it at least 8 characters long</li>
          <li>Don't use personal information or common words</li>
          <li>Don't share your password with anyone</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
          Keep Your Account Safe! 🛡️
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 Khuddam Learning. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    variables: [
      { key: "userName", description: "User's name" },
      { key: "newPassword", description: "Auto-generated new password" }
    ],
    isActive: true
  },
  {
    name: "Newsletter Verification Email",
    subject: "Newsletter Subscription Confirmation - Khuddam Learning",
    type: "notification",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter Subscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">📧</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Newsletter Subscription</h1>
      <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Thank you for subscribing!</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #293c5d; margin: 0; font-size: 22px;">Welcome to our Newsletter!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">Stay updated with Khuddam Learning</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 15px; padding: 30px; margin: 25px 0; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 15px;">✅</div>
        <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">Subscription Confirmed!</h3>
        <p style="color: #16a34a; margin: 0; font-size: 16px; line-height: 1.6;">
          Your email <strong>{{email}}</strong> has been successfully added to our newsletter. 
          You'll receive updates about new courses, educational content, and important announcements.
        </p>
      </div>
      
      <div style="background: #fafafa; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #293c5d; margin: 0 0 20px 0; font-size: 18px; text-align: center;">📚 What to Expect:</h3>
        <ul style="color: #4b5563; margin: 0; padding-left: 0; list-style: none; line-height: 1.8;">
          <li style="margin-bottom: 10px; padding-left: 30px; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
            Course announcements and new class schedules
          </li>
          <li style="margin-bottom: 10px; padding-left: 30px; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
            Educational tips and study resources
          </li>
          <li style="margin-bottom: 10px; padding-left: 30px; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
            Important updates and notifications
          </li>
          <li style="padding-left: 30px; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
            Special events and community news
          </li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
          Welcome to the Khuddam Learning Community! 🎉
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 Khuddam Learning. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    variables: [
      { key: "email", description: "Subscriber's email address" }
    ],
    isActive: true
  },
  {
    name: "Exam Notification Email",
    subject: "Upcoming Exam - {{examTitle}}",
    type: "notification",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exam Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">📋</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Exam Notification</h1>
      <p style="color: #ede9fe; margin: 10px 0 0 0; font-size: 16px;">Important Exam Information</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #293c5d; margin: 0; font-size: 22px;">Hello {{studentName}}!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">You have an upcoming exam</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border: 2px solid #8b5cf6; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">📅</div>
        <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">{{examTitle}}</h3>
        <p style="color: #8b5cf6; margin: 0; font-size: 16px;">
          Subject: <strong>{{subject}}</strong> | Date: <strong>{{examDate}}</strong>
        </p>
      </div>
      
      <div style="background: #fef3c7; border-radius: 15px; padding: 30px; margin: 25px 0; border: 2px solid #fbbf24;">
        <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; text-align: center; font-weight: bold;">
          📝 Exam Details
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">START TIME</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">{{startTime}}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">DURATION</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">{{duration}}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">TOTAL MARKS</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">{{totalMarks}}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">LOCATION</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">{{location}}</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{examUrl}}" 
           style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
          📋 Take Exam
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
          Best of Luck! 🍀
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 Khuddam Learning. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    variables: [
      { key: "studentName", description: "Student's name" },
      { key: "examTitle", description: "Title of the exam" },
      { key: "subject", description: "Subject name" },
      { key: "examDate", description: "Exam date" },
      { key: "startTime", description: "Exam start time" },
      { key: "duration", description: "Exam duration" },
      { key: "totalMarks", description: "Total marks" },
      { key: "location", description: "Exam location" },
      { key: "examUrl", description: "URL to take exam" }
    ],
    isActive: true
  },
  {
    name: "General Announcement Email",
    subject: "Important Announcement - {{announcementTitle}}",
    type: "announcement",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Announcement</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">📢</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Important Announcement</h1>
      <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">Khuddam Learning Updates</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #293c5d; margin: 0; font-size: 24px; font-weight: bold;">{{announcementTitle}}</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">{{announcementDate}}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 25px; margin: 25px 0;">
        <div style="color: #1e40af; font-size: 16px; line-height: 1.7;">
          {{announcementContent}}
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
          Stay Connected! 📱
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 Khuddam Learning. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    variables: [
      { key: "announcementTitle", description: "Title of the announcement" },
      { key: "announcementDate", description: "Date of announcement" },
      { key: "announcementContent", description: "Main content of the announcement" }
    ],
    isActive: true
  },
  {
    name: "Assignment Reminder",
    subject: "Assignment Due Soon - {{assignmentTitle}}",
    type: "reminder",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">⏰</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Assignment Reminder</h1>
      <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Don't Miss Your Deadline!</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #293c5d; margin: 0; font-size: 22px;">Hi {{studentName}}!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">This is a friendly reminder about your upcoming assignment</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
        <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">Assignment Due Soon!</h3>
        <p style="color: #991b1b; margin: 0; font-size: 16px; font-weight: 600;">
          Time Remaining: <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px;">{{timeLeft}}</span>
        </p>
      </div>
      
      <div style="background: #fffbeb; border-radius: 15px; padding: 30px; margin: 25px 0; border: 2px solid #fbbf24;">
        <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; text-align: center; font-weight: bold;">
          📝 {{assignmentTitle}}
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">SUBJECT</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">{{subject}}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">DUE DATE</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">{{dueDate}}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">DUE TIME</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">{{dueTime}}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">TOTAL MARKS</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">{{totalMarks}}</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{submissionUrl}}" 
           style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
          🚀 Submit Assignment Now
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
          You've Got This! 💪
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 Khuddam Learning. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    variables: [
      { key: "studentName", description: "Student's name" },
      { key: "assignmentTitle", description: "Title of the assignment" },
      { key: "subject", description: "Subject name" },
      { key: "dueDate", description: "Assignment due date" },
      { key: "dueTime", description: "Assignment due time" },
      { key: "totalMarks", description: "Total marks for assignment" },
      { key: "timeLeft", description: "Time remaining until deadline" },
      { key: "submissionUrl", description: "URL to submit assignment" }
    ],
    isActive: true
  }
];

// Seed templates
const seedTemplates = async () => {
  try {
    // Clear existing templates
    await EmailMatter.deleteMany({});
    console.log("Cleared existing email templates");

    // Create a system admin user ID for templates (or use existing admin)
    const systemAdminId = new mongoose.Types.ObjectId("000000000000000000000001");
    
    // Add created_by to each template
    const templatesWithCreator = emailTemplates.map(template => ({
      ...template,
      created_by: systemAdminId
    }));

    // Insert new templates
    const insertedTemplates = await EmailMatter.insertMany(templatesWithCreator);
    console.log(`Successfully seeded ${insertedTemplates.length} email templates:`);
    
    insertedTemplates.forEach(template => {
      console.log(`- ${template.name} (${template.type})`);
    });

  } catch (error) {
    console.error("Error seeding templates:", error);
  }
};

// Run the seeding
const runSeed = async () => {
  await connectDB();
  await seedTemplates();
  mongoose.connection.close();
  console.log("Database connection closed");
};

runSeed();