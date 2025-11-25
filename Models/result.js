import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
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
        exam_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExamSchedule", // Assuming the model name is ExamSchedule
            required: true,
        },
        exam_name: {
            type: String,
            required: true,
        },
        class_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        marks_obtained: {
            type: Number,
            required: true,
            min: 0,
        },
        total_marks: {
            type: Number,
            required: true,
            min: 1,
        },
        percentage: {
            type: Number,
        },
        grade: {
            type: String,
        },
        remarks: {
            type: String,
        },
        isPublished: {
            type: Boolean,
            default: false,
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

// Pre-save hook to calculate percentage and grade
resultSchema.pre("save", function (next) {
    if (this.marks_obtained !== undefined && this.total_marks !== undefined) {
        this.percentage = (this.marks_obtained / this.total_marks) * 100;

        if (this.percentage >= 90) this.grade = "A+";
        else if (this.percentage >= 80) this.grade = "A";
        else if (this.percentage >= 70) this.grade = "B";
        else if (this.percentage >= 60) this.grade = "C";
        else if (this.percentage >= 50) this.grade = "D";
        else this.grade = "F";
    }
    next();
});

resultSchema.index({ student_id: 1, exam_id: 1 }, { unique: true }); // Prevent duplicate results for same exam
resultSchema.index({ class_id: 1, exam_id: 1 });

const Result = mongoose.model("Result", resultSchema);

export default Result;
