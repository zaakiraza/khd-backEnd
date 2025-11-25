import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        user_name: {
            type: String,
            required: true,
        },
        leave_type: {
            type: String,
            enum: ["sick", "casual", "emergency", "other"],
            required: true,
        },
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        approved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        admin_comments: {
            type: String,
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

leaveSchema.index({ user_id: 1, status: 1 });
leaveSchema.index({ start_date: 1, end_date: 1 });

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
