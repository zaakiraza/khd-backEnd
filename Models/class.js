import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
    {
        class_name: {
            type: String,
            required: true,
            unique: true
        },
        teacher_assigned: {
            type: String,
            required: false,
        },
        students_passed: {
            type: Number,
            default: 0,
        },
        students_enrolled: {
            type: Number,
            default: 0,
        },
        class_timing: {
            type: String,
            required: false,
            default: ""
        },
        class_day: {
            type: String,
            required: false,
            default: ""
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Class", classSchema);
