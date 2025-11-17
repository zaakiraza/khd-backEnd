import mongoose from "mongoose";

const emailMatterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["otp", "welcome", "notification", "announcement", "reminder", "custom"],
      default: "custom",
    },
    variables: [
      {
        key: String,
        description: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    created_by: {
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
emailMatterSchema.index({ name: 1, isActive: 1 });
emailMatterSchema.index({ type: 1 });

const EmailMatter = mongoose.model("EmailMatter", emailMatterSchema);

export default EmailMatter;
