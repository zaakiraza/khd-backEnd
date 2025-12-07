import cron from "node-cron";
import { sendAssignmentReminders, sendExamNotifications } from "./notificationService.js";

/**
 * Cron job scheduler for automated email notifications
 * This file sets up automated tasks that run at scheduled intervals
 */

// Run assignment reminders every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily assignment reminders at 9:00 AM');
  try {
    await sendAssignmentReminders();
    console.log('Assignment reminders completed successfully');
  } catch (error) {
    console.error('Failed to send assignment reminders:', error);
  }
}, {
  timezone: "Asia/Karachi" // Adjust timezone as needed
});

// Run exam notifications every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily exam notifications at 8:00 AM');
  try {
    await sendExamNotifications();
    console.log('Exam notifications completed successfully');
  } catch (error) {
    console.error('Failed to send exam notifications:', error);
  }
}, {
  timezone: "Asia/Karachi" // Adjust timezone as needed
});

// Run assignment reminders at 6:00 PM as well for urgent reminders
cron.schedule('0 18 * * *', async () => {
  console.log('Running evening assignment reminders at 6:00 PM');
  try {
    await sendAssignmentReminders();
    console.log('Evening assignment reminders completed successfully');
  } catch (error) {
    console.error('Failed to send evening assignment reminders:', error);
  }
}, {
  timezone: "Asia/Karachi"
});

console.log('📅 Cron jobs scheduled:');
console.log('- Assignment reminders: 9:00 AM and 6:00 PM daily');
console.log('- Exam notifications: 8:00 AM daily');

export default {
  // Export functions for manual testing if needed
  sendAssignmentReminders,
  sendExamNotifications
};