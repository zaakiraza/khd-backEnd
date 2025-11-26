import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  selected_option: String, // For multiple choice
  is_correct: Boolean,
  marks_obtained: {
    type: Number,
    default: 0,
  },
});

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student_name: {
      type: String,
      required: true,
    },
    answers: [answerSchema],
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
    status: {
      type: String,
      enum: ["submitted", "graded", "late"],
      default: "submitted",
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
    total_marks_obtained: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
    },
    graded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    graded_at: {
      type: Date,
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

// Index for better query performance
assignmentSubmissionSchema.index({ assignment_id: 1, student_id: 1 });
assignmentSubmissionSchema.index({ student_id: 1, status: 1 });

const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);

export default AssignmentSubmission;
