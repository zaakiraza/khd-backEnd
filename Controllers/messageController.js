import Message from "../Models/message.js";
import User from "../Models/user.js";
import EmailMatter from "../Models/emailMatter.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";
import { sendEmail } from "../Utlis/nodeMailer.js";

// Create/Send Message
const createMessage = async (req, res) => {
  try {
    const {
      type,
      recipients,
      subject,
      message,
      email_matter_id,
      scheduled_at,
    } = req.body;

    // Validate email matter if provided
    if (email_matter_id) {
      const emailMatter = await EmailMatter.findById(email_matter_id);
      if (!emailMatter) {
        return errorHandler(res, 404, "Email matter not found");
      }
    }

    const newMessage = new Message({
      type,
      recipients,
      subject,
      message,
      email_matter_id,
      scheduled_at,
      status: scheduled_at ? "scheduled" : "draft",
      sent_by: req.user.id,
    });

    await newMessage.save();
    successHandler(res, 201, "Message created successfully", newMessage);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Send Message Now
const sendMessageNow = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return errorHandler(res, 404, "Message not found");
    }

    if (message.status === "sent") {
      return errorHandler(res, 400, "Message already sent");
    }

    // Get recipients
    let recipientsList = [];

    if (message.recipients.all) {
      // Get all users
      const users = await User.find({ isActive: true });
      recipientsList = message.type === "email" 
        ? users.map(u => u.email).filter(e => e)
        : users.map(u => u.phone).filter(p => p);
    } else {
      // Apply filters
      const filter = { isActive: true };
      
      if (message.recipients.filters.class_ids?.length > 0) {
        filter.class_id = { $in: message.recipients.filters.class_ids };
      }
      
      if (message.recipients.filters.session_ids?.length > 0) {
        filter.session_id = { $in: message.recipients.filters.session_ids };
      }
      
      if (message.recipients.filters.roles?.length > 0) {
        filter.role = { $in: message.recipients.filters.roles };
      }

      const users = await User.find(filter);
      recipientsList = message.type === "email" 
        ? users.map(u => u.email).filter(e => e)
        : users.map(u => u.phone).filter(p => p);

      // Add custom recipients
      if (message.type === "email" && message.recipients.custom_emails?.length > 0) {
        recipientsList.push(...message.recipients.custom_emails);
      }
      if (message.type === "sms" && message.recipients.custom_phones?.length > 0) {
        recipientsList.push(...message.recipients.custom_phones);
      }
    }

    // Remove duplicates
    recipientsList = [...new Set(recipientsList)];

    if (recipientsList.length === 0) {
      return errorHandler(res, 400, "No recipients found");
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send messages
    if (message.type === "email") {
      for (const email of recipientsList) {
        try {
          await sendEmail(email, message.subject, message.message);
          sentCount++;
        } catch (error) {
          failedCount++;
        }
      }
    } else {
      // SMS implementation would go here
      // For now, just mark as sent
      sentCount = recipientsList.length;
    }

    // Update message status
    message.status = "sent";
    message.sent_at = new Date();
    message.sent_count = sentCount;
    message.failed_count = failedCount;
    await message.save();

    successHandler(res, 200, `Message sent to ${sentCount} recipients. ${failedCount} failed.`, message);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get All Messages with filters
const getAllMessages = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    const messages = await Message.find(filter)
      .populate("email_matter_id", "name subject")
      .populate("sent_by", "name email")
      .sort({ createdAt: -1 });

    successHandler(res, 200, "Messages fetched successfully", messages, messages.length);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Message by ID
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id)
      .populate("email_matter_id", "name subject body")
      .populate("sent_by", "name email")
      .populate("recipients.filters.class_ids", "class_name")
      .populate("recipients.filters.session_ids", "session_name");

    if (!message) {
      return errorHandler(res, 404, "Message not found");
    }

    successHandler(res, 200, "Message fetched successfully", message);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Update Message (only drafts)
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, recipients, subject, message, email_matter_id, scheduled_at } = req.body;

    const existingMessage = await Message.findById(id);
    if (!existingMessage) {
      return errorHandler(res, 404, "Message not found");
    }

    if (existingMessage.status === "sent") {
      return errorHandler(res, 400, "Cannot update sent message");
    }

    // Update fields
    if (type) existingMessage.type = type;
    if (recipients) existingMessage.recipients = recipients;
    if (subject) existingMessage.subject = subject;
    if (message) existingMessage.message = message;
    if (email_matter_id) existingMessage.email_matter_id = email_matter_id;
    if (scheduled_at) existingMessage.scheduled_at = scheduled_at;

    await existingMessage.save();
    successHandler(res, 200, "Message updated successfully", existingMessage);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Delete Message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return errorHandler(res, 404, "Message not found");
    }

    successHandler(res, 200, "Message deleted successfully", null);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Message Statistics
const getMessageStatistics = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const sentMessages = await Message.countDocuments({ status: "sent" });
    const scheduledMessages = await Message.countDocuments({ status: "scheduled" });
    const draftMessages = await Message.countDocuments({ status: "draft" });
    const failedMessages = await Message.countDocuments({ status: "failed" });

    const totalSent = await Message.aggregate([
      { $match: { status: "sent" } },
      { $group: { _id: null, total: { $sum: "$sent_count" } } },
    ]);

    const statistics = {
      totalMessages,
      sentMessages,
      scheduledMessages,
      draftMessages,
      failedMessages,
      totalRecipientsSent: totalSent[0]?.total || 0,
    };

    successHandler(res, 200, "Statistics fetched successfully", statistics);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Student Announcements
const getStudentAnnouncements = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return errorHandler(res, 404, "User not found");
    }

    // Get user's current class from class_history
    const currentClass = user.class_history?.find(ch => ch.status === "active");
    
    // Build query for announcements
    const query = {
      status: "sent",
      $or: [
        { "recipients.all": true }, // All students
        { "recipients.filters.class_ids": currentClass?.class_name }, // User's class
      ]
    };

    const announcements = await Message.find(query)
      .select("subject message type sent_at createdAt")
      .sort({ sent_at: -1 })
      .limit(50);

    successHandler(res, 200, "Announcements fetched successfully", announcements, announcements.length);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

export {
  createMessage,
  sendMessageNow,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getMessageStatistics,
  getStudentAnnouncements,
};
