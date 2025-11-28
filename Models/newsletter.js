import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ["website", "admin", "import"],
      default: "website",
    },
    verificationToken: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    preferences: {
      announcements: {
        type: Boolean,
        default: true,
      },
      classUpdates: {
        type: Boolean,
        default: true,
      },
      events: {
        type: Boolean,
        default: true,
      },
      results: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1, isVerified: 1 });
newsletterSchema.index({ subscribedAt: -1 });

// Virtual for subscription status
newsletterSchema.virtual("status").get(function () {
  if (!this.isVerified) return "pending";
  if (!this.isActive) return "unsubscribed";
  return "active";
});

// Method to generate verification token
newsletterSchema.methods.generateVerificationToken = function () {
  this.verificationToken = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  return this.verificationToken;
};

// Method to verify subscription
newsletterSchema.methods.verify = function () {
  this.isVerified = true;
  this.verificationToken = null;
  return this.save();
};

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function () {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function () {
  this.isActive = true;
  this.unsubscribedAt = null;
  this.subscribedAt = new Date();
  return this.save();
};

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;