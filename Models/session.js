import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        session_name: {
            type: String,
            required: true,
            unique: true
        },
        isActive: {
            type: Boolean,
            default: true,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Session", sessionSchema);
