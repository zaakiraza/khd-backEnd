import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    exam_name: {
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
    },
    exam_date: {
      type: Date,
      required: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    total_marks: {
      type: Number,
      required: true,
      default: 100,
    },
    passing_marks: {
      type: Number,
      required: true,
      default: 40,
    },
    exam_type: {
      type: String,
      enum: ["final"],
      default: "final",
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    questions: [
      {
        question_text: {
          type: String,
          required: false,
        },
        question_type: {
          type: String,
          enum: ["mcq", "true_false", "short_answer", "essay"],
          default: "mcq",
        },
        options: [String],
        correct_answer: String,
        marks: {
          type: Number,
          default: 1,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
examScheduleSchema.index({ class_id: 1, exam_date: 1 });
examScheduleSchema.index({ exam_date: 1, status: 1 });

export default mongoose.model("ExamSchedule", examScheduleSchema);
