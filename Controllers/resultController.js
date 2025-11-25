import Result from "../Models/result.js";
import User from "../Models/user.js";
import Class from "../Models/class.js";
// import ExamSchedule from "../Models/examSchedule.js"; // Import if needed for validation

// Add Result
export const addResult = async (req, res) => {
    try {
        const {
            student_id,
            exam_id,
            exam_name,
            class_id,
            subject,
            marks_obtained,
            total_marks,
            remarks,
        } = req.body;

        const student = await User.findById(student_id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if result already exists
        const existingResult = await Result.findOne({ student_id, exam_id });
        if (existingResult) {
            return res.status(400).json({ message: "Result already exists for this student and exam" });
        }

        const newResult = new Result({
            student_id,
            student_name: student.name,
            exam_id,
            exam_name,
            class_id,
            subject,
            marks_obtained,
            total_marks,
            remarks,
        });

        await newResult.save();
        res.status(201).json({ message: "Result added successfully", data: newResult });
    } catch (error) {
        res.status(500).json({ message: "Error adding result", error: error.message });
    }
};

// Get Results by Exam (for a class)
export const getResultsByExam = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const results = await Result.find({ exam_id, isActive: true }).sort({ marks_obtained: -1 });
        res.status(200).json({ data: results });
    } catch (error) {
        res.status(500).json({ message: "Error fetching results", error: error.message });
    }
};

// Get Results by Student
export const getResultsByStudent = async (req, res) => {
    try {
        const { student_id } = req.params;
        // If student is requesting, ensure they only see their own results
        if (req.user.role === "student" && req.user.userId !== student_id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const results = await Result.find({ student_id, isActive: true, isPublished: true }).sort({ createdAt: -1 });
        res.status(200).json({ data: results });
    } catch (error) {
        res.status(500).json({ message: "Error fetching results", error: error.message });
    }
};

// Update Result
export const updateResult = async (req, res) => {
    try {
        const { marks_obtained, remarks } = req.body;

        // Recalculate percentage and grade is handled in pre-save hook, 
        // but findByIdAndUpdate bypasses hooks unless configured. 
        // Better to find, update fields, and save.

        const result = await Result.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        if (marks_obtained !== undefined) result.marks_obtained = marks_obtained;
        if (remarks !== undefined) result.remarks = remarks;

        await result.save();

        res.status(200).json({ message: "Result updated successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: "Error updating result", error: error.message });
    }
};

// Publish Results (Bulk)
export const publishResults = async (req, res) => {
    try {
        const { exam_id } = req.body;
        await Result.updateMany({ exam_id }, { isPublished: true });
        res.status(200).json({ message: "Results published successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error publishing results", error: error.message });
    }
};

// Delete Result
export const deleteResult = async (req, res) => {
    try {
        const result = await Result.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        res.status(200).json({ message: "Result deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting result", error: error.message });
    }
};
