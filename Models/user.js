import mongoose from "mongoose";
import Class from "./class.js";
import Session from "./session.js";

// --- Counter Schema for Auto-Increment ---
const counterSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g. "user_rollNo"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

const userSchema = new mongoose.Schema(
  {
    personal_info: {
      first_name: { type: String, required: true, trim: true },
      last_name: { type: String, required: true, trim: true },
      father_name: { type: String, required: true, trim: true },
      gender: { type: String, required: true },
      whatsapp_no: { type: String, required: true },
      dob: { type: String, required: true },
      age: { type: Number, required: true },
      img_URL: { type: String, required: true },
      CNIC: { type: Number, required: true, unique: true },
      alternative_no: { type: String, required: false },
      email: { type: String, required: true, lowercase: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      doc_img: { type: String, required: true },
      enrolled_year: { type: String, required: true },
      marj_e_taqleed: { type: String, required: true },
      // halafnama: { type: Boolean, required: false },
      verified: { type: Boolean, required: true, default: false },
      isAdmin: { type: Boolean, required: true, default: false },
      password: { type: String, default: undefined },
      otp: { type: String, default: undefined },
      otpExpiresAt: { type: Date, default: undefined },
      rollNo: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
      application_status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      enrolled_class: {
        type: String,
        enum: [
          "null",
          "Atfaal-Awal",
          "Atfaal-doam",
          "Awwal",
          "Doam",
          "Soam",
          "Chaharum",
        ],
        default: "null",
      },
    },

    guardian_info: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      email: { type: String, required: true },
      whatsapp_no: { type: String, required: true },
      address: { type: String, required: true },
      CNIC: { type: Number, required: true },
    },

    academic_progress: {
      academic_class: { type: Number, required: true },
      institute_name: { type: String, required: true },
      inProgress: { type: Boolean, default: false, required: true },
      result: { type: String, required: false },
    },

    previous_madrassa: {
      name: { type: String, required: false },
      topic: { type: String, required: false },
    },

    bank_info: {
      bank_name: { type: String, required: false },
      account_number: { type: String, required: false },
      account_title: { type: String, required: false },
      branch: { type: String, required: false },
    },

    class_history: [
      {
        class_name: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
          required: true,
        },
        year: { type: String, required: true },
        session: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Session",
          required: true,
        },
        status: {
          type: String,
          enum: ["inprogress", "pass", "fail","left"],
          required: true,
        },
        result: { type: String, enum: ["Pass", "Fail"], allowNull: true },
        repeat_count: { type: Number, default: 0, allowNull: true },
        isCompleted: { type: Boolean, default: false, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "user_rollNo" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.personal_info.rollNo = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

userSchema.methods.addClassHistory = function (classHistoryData) {
  this.class_history.push(classHistoryData);
  return this.save();
};
export default mongoose.model("User", userSchema);
