import mongoose from "mongoose";

const lessonPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    class_name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    week_number: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    content: {
      type: String, // Can be HTML or Markdown - Legacy field
      required: false,
    },
    file_url: {
      type: String, // Cloudinary URL for PDF/PPT
      required: false,
    },
    file_name: {
      type: String, // Original filename
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

lessonPlanSchema.index({ class_id: 1, week_number: 1, year: 1 });
lessonPlanSchema.index({ status: 1, isActive: 1 });

const LessonPlan = mongoose.model("LessonPlan", lessonPlanSchema);

export default LessonPlan;
