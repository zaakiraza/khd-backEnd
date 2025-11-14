import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
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
    due_date: {
      type: Date,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    total_marks: {
      type: Number,
      default: 100,
      min: 1,
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
    week_number: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
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
assignmentSchema.index({ class_id: 1, week_number: 1, year: 1 });
assignmentSchema.index({ due_date: 1, status: 1 });
assignmentSchema.index({ status: 1, isActive: 1 });

// Virtual property to check if assignment has expired
assignmentSchema.virtual('isExpired').get(function() {
  if (this.status === 'closed') return true;
  
  const now = new Date();
  const dueDate = new Date(this.due_date);
  const [hours, minutes] = this.end_time.split(':');
  dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return now > dueDate;
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
