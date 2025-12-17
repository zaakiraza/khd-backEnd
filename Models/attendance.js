import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    class_name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    attendance_records: [
      {
        student_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        student_name: {
          type: String,
          required: true,
        },
        roll_no: {
          type: String,
        },
        status: {
          type: String,
          enum: ["present", "absent", "late", "leave"],
          required: true,
        },
        marked_at: {
          type: Date,
          default: Date.now,
        },
        // Zoom-specific fields
        zoom_name: {
          type: String,
          default: null,
        },
        zoom_duration: {
          type: Number,
          default: 0,
        },
        zoom_join_time: {
          type: String,
          default: null,
        },
        zoom_leave_time: {
          type: String,
          default: null,
        },
      },
    ],
    source: {
      type: String,
      enum: ["manual", "zoom"],
      default: "manual",
    },
    marked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_students: {
      type: Number,
      required: true,
    },
    total_present: {
      type: Number,
      default: 0,
    },
    total_absent: {
      type: Number,
      default: 0,
    },
    total_late: {
      type: Number,
      default: 0,
    },
    total_leave: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one attendance record per class per date
attendanceSchema.index({ class_id: 1, date: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ class_name: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
