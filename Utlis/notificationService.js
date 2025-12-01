import Assignment from "../Models/assignment.js";
import ExamSchedule from "../Models/examSchedule.js";
import User from "../Models/user.js";
import Class from "../Models/class.js";
import { sendEmail } from "../Utlis/nodeMailer.js";
import { getEmailTemplate } from "../Utlis/emailTemplateHelper.js";

/**
 * Send assignment reminder notifications
 * This function should be called by a cron job daily
 */
export const sendAssignmentReminders = async () => {
  try {
    console.log("Starting assignment reminder notifications...");

    // Find assignments due in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAssignments = await Assignment.find({
      due_date: {
        $gte: today,
        $lte: tomorrow
      },
      status: { $in: ['published', 'ongoing'] }
    }).populate({
      path: 'class_id',
      select: 'name'
    });

    console.log(`Found ${upcomingAssignments.length} assignments due soon`);

    for (const assignment of upcomingAssignments) {
      try {
        // Get students in the class
        const students = await User.find({
          "academic_progress.class": assignment.class_id._id,
          "personal_info.verified": true
        });

        console.log(`Sending reminders to ${students.length} students for assignment: ${assignment.title}`);

        // Calculate time remaining
        const now = new Date();
        const dueDateTime = new Date(`${assignment.due_date.toDateString()} ${assignment.end_time}`);
        const timeDiff = dueDateTime - now;
        const hoursRemaining = Math.ceil(timeDiff / (1000 * 60 * 60));
        
        let timeLeft;
        if (hoursRemaining < 24) {
          timeLeft = `${hoursRemaining} hours`;
        } else {
          const daysRemaining = Math.ceil(hoursRemaining / 24);
          timeLeft = `${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`;
        }

        // Send reminder to each student
        for (const student of students) {
          const reminderTemplate = await getEmailTemplate('reminder', {
            studentName: student.personal_info.first_name,
            assignmentTitle: assignment.title,
            subject: assignment.class_id.name,
            dueDate: assignment.due_date.toLocaleDateString(),
            dueTime: assignment.end_time,
            totalMarks: assignment.total_marks,
            timeLeft: timeLeft,
            submissionUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/student/assignments/${assignment._id}`
          });

          if (reminderTemplate) {
            await sendEmail({
              to: student.personal_info.email,
              subject: reminderTemplate.subject,
              html: reminderTemplate.body
            });
          }
        }

      } catch (error) {
        console.error(`Error sending reminders for assignment ${assignment._id}:`, error);
      }
    }

    console.log("Assignment reminder notifications completed");

  } catch (error) {
    console.error("Error in sendAssignmentReminders:", error);
  }
};

/**
 * Send exam notification emails
 * This function should be called by a cron job daily
 */
export const sendExamNotifications = async () => {
  try {
    console.log("Starting exam notifications...");

    // Find exams scheduled for the next 3 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const upcomingExams = await ExamSchedule.find({
      exam_date: {
        $gte: today,
        $lte: threeDaysFromNow
      },
      status: { $in: ['scheduled', 'published'] }
    }).populate({
      path: 'class_id',
      select: 'name'
    });

    console.log(`Found ${upcomingExams.length} upcoming exams`);

    for (const exam of upcomingExams) {
      try {
        // Get students in the class
        const students = await User.find({
          "academic_progress.class": exam.class_id._id,
          "personal_info.verified": true
        });

        console.log(`Sending exam notifications to ${students.length} students for exam: ${exam.exam_title}`);

        // Calculate exam duration
        const startTime = new Date(`1970-01-01T${exam.start_time}`);
        const endTime = new Date(`1970-01-01T${exam.end_time}`);
        const durationMs = endTime - startTime;
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        let duration = "";
        if (hours > 0) {
          duration += `${hours}h `;
        }
        if (minutes > 0) {
          duration += `${minutes}m`;
        }

        // Send notification to each student
        for (const student of students) {
          const examTemplate = await getEmailTemplate('notification', {
            studentName: student.personal_info.first_name,
            examTitle: exam.exam_title,
            subject: exam.class_id.name,
            examDate: exam.exam_date.toLocaleDateString(),
            startTime: exam.start_time,
            duration: duration,
            totalMarks: exam.total_marks,
            location: exam.location || "Online",
            examUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/student/exams/${exam._id}`
          });

          if (examTemplate) {
            await sendEmail({
              to: student.personal_info.email,
              subject: examTemplate.subject,
              html: examTemplate.body
            });
          }
        }

      } catch (error) {
        console.error(`Error sending notifications for exam ${exam._id}:`, error);
      }
    }

    console.log("Exam notifications completed");

  } catch (error) {
    console.error("Error in sendExamNotifications:", error);
  }
};

/**
 * Send welcome email to new students
 */
export const sendWelcomeEmail = async (studentId, className = null) => {
  try {
    const student = await User.findById(studentId).populate({
      path: 'academic_progress.class',
      select: 'name'
    });

    if (!student) {
      console.error("Student not found for welcome email");
      return;
    }

    const welcomeTemplate = await getEmailTemplate('welcome', {
      studentName: student.personal_info.first_name + ' ' + student.personal_info.last_name,
      className: className || student.academic_progress.class?.name || "Your Class",
      loginUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`
    });

    if (welcomeTemplate) {
      await sendEmail({
        to: student.personal_info.email,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.body
      });

      console.log(`Welcome email sent to: ${student.personal_info.email}`);
    }

  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

/**
 * Send announcement emails to all active students
 */
export const sendAnnouncementEmail = async (announcementData) => {
  try {
    console.log("Starting announcement email broadcast...");

    const { title, content, targetAudience = "all" } = announcementData;

    // Get all verified students
    let students;
    if (targetAudience === "all") {
      students = await User.find({
        "personal_info.verified": true
      });
    } else if (targetAudience.startsWith("class_")) {
      const classId = targetAudience.split("_")[1];
      students = await User.find({
        "academic_progress.class": classId,
        "personal_info.verified": true
      });
    }

    console.log(`Sending announcement to ${students.length} students`);

    const announcementTemplate = await getEmailTemplate('announcement', {
      announcementTitle: title,
      announcementDate: new Date().toLocaleDateString(),
      announcementContent: content
    });

    if (announcementTemplate) {
      // Send in batches to avoid overwhelming email server
      const batchSize = 50;
      for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);
        
        const emailPromises = batch.map(student => 
          sendEmail({
            to: student.personal_info.email,
            subject: announcementTemplate.subject,
            html: announcementTemplate.body
          })
        );

        await Promise.all(emailPromises);
        
        // Small delay between batches
        if (i + batchSize < students.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.log("Announcement email broadcast completed");

  } catch (error) {
    console.error("Error sending announcement emails:", error);
  }
};

export default {
  sendAssignmentReminders,
  sendExamNotifications,
  sendWelcomeEmail,
  sendAnnouncementEmail
};