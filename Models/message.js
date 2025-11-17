import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },
    recipients: {
      all: {
        type: Boolean,
        default: false,
      },
      filters: {
        class_ids: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
          },
        ],
        session_ids: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
          },
        ],
        roles: [
          {
            type: String,
            enum: ["student", "teacher", "admin"],
          },
        ],
      },
      custom_emails: [String],
      custom_phones: [String],
    },
    subject: {
      type: String,
      required: function () {
        return this.type === "email";
      },
    },
    message: {
      type: String,
      required: true,
    },
    email_matter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailMatter",
    },
    status: {
      type: String,
      enum: ["draft", "sent", "scheduled", "failed"],
      default: "draft",
    },
    scheduled_at: {
      type: Date,
    },
    sent_at: {
      type: Date,
    },
    sent_count: {
      type: Number,
      default: 0,
    },
    failed_count: {
      type: Number,
      default: 0,
    },
    sent_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
messageSchema.index({ status: 1, type: 1 });
messageSchema.index({ sent_at: -1 });
messageSchema.index({ scheduled_at: 1, status: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
