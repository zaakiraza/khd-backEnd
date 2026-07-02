# Khuddam Backend

This repository contains the backend service for the Khuddam learning platform. It provides authentication, student/admin management, class operations, attendance, assignments, quizzes, lesson plans, notifications, and reporting APIs.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for file uploads
- Nodemailer for email sending
- CORS and file upload support

## Project Structure

- app.js: Main application entry point
- Controllers/: Request handlers for each feature area
- Routes/: API route definitions
- Models/: Mongoose schemas
- Middleware/: Authentication and admin authorization
- Utils/: Database connection, email, notifications, and cron jobs
- uploads/: Uploaded lesson plan files

## Features

- User registration, login, OTP verification, password reset, and change password
- Admin and student role-based access
- Class management and enrolled student tracking
- Attendance handling
- Exam schedules and results
- Assignments and assignment submissions
- Quizzes and quiz attempts
- Lesson plans and file uploads
- Leave requests
- Messages, newsletters, and notifications
- Email templates and reminder automation

## Prerequisites

- Node.js 18+
- MongoDB instance
- SMTP email credentials

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the project root with the required environment variables:

   ```env
   PORT=5000
   MONGOURI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   JWT_admin_EXPIRES_IN=7d
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_email_app_password
   FRONTEND_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloud_api_key
   CLOUDINARY_API_SECRET=your_cloud_api_secret
   ```

## Running the Server

Start the development server with:

```bash
npm start
```

The server will run using Node's watch mode and listen on the configured port.

## API Overview

The application exposes REST APIs under the following base paths:

- /api/auth
- /api/session
- /api/class
- /api/users
- /api/attendance
- /api/exam-schedule
- /api/assignment
- /api/assignment-submission
- /api/quiz
- /api/quiz-attempt
- /api/email-matter
- /api/message
- /api/lesson-plan
- /api/leave
- /api/result
- /api/report
- /api/newsletter
- /api/notifications

## Notes

- Admin-protected routes require a valid JWT and admin privileges.
- File uploads are handled through the upload and lesson plan routes.
- Notification and reminder jobs are wired through the cron utilities.

## License

ISC