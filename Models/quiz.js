import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
  },
  question_type: {
    type: String,
    enum: ["multiple_choice", "true_false", "short_answer", "essay"],
    required: true,
  },
  options: [
    {
      option_text: String,
      is_correct: Boolean,
    },
  ],
  correct_answer: {
    type: String,
  },
  marks: {
    type: Number,
    required: true,
    min: 1,
  },
});

const quizSchema = new mongoose.Schema(
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
    quiz_date: {
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
      type: Number,
      required: true,
      min: 5,
    },
    total_marks: {
      type: Number,
      default: 0,
    },
    passing_marks: {
      type: Number,
      default: 40,
    },
    questions: [questionSchema],
    status: {
      type: String,
      enum: ["draft", "published", "ongoing", "completed"],
      default: "draft",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
quizSchema.index({ class_id: 1, quiz_date: 1 });
quizSchema.index({ quiz_date: 1, status: 1 });
quizSchema.index({ status: 1, isActive: 1 });

// Calculate total marks before saving
quizSchema.pre("save", function (next) {
  if (this.questions && this.questions.length > 0) {
    this.total_marks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  }
  next();
});

// Virtual property to check if quiz has expired
quizSchema.virtual('isExpired').get(function() {
  if (this.status === 'completed') return true;
  
  const now = new Date();
  const quizDate = new Date(this.quiz_date);
  const [hours, minutes] = this.end_time.split(':');
  quizDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return now > quizDate;
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
