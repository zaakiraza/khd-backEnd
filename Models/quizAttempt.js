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

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
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
    status: {
      type: String,
      enum: ["in_progress", "submitted", "graded"],
      default: "in_progress",
    },
    started_at: {
      type: Date,
      default: Date.now,
    },
    submitted_at: {
      type: Date,
    },
    total_marks_obtained: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    time_taken: {
      type: Number, // in minutes
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
quizAttemptSchema.index({ quiz_id: 1, student_id: 1 });
quizAttemptSchema.index({ student_id: 1, status: 1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
