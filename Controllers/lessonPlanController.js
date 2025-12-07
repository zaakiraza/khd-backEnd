import LessonPlan from "../Models/lessonPlan.js";
import Class from "../Models/class.js";

// Create Lesson Plan
export const createLessonPlan = async (req, res) => {
    try {
        const {
            title,
            description,
            class_id,
            subject,
            week_number,
            year,
            content,
            file_url,
            file_name,
            status,
            attachments,
        } = req.body;

        const classData = await Class.findById(class_id);
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }

        const newLessonPlan = new LessonPlan({
            title,
            description,
            class_id,
            class_name: classData.class_name,
            subject,
            week_number,
            year,
            content,
            file_url,
            file_name,
            status,
            attachments,
            created_by: req.user.userId,
        });

        await newLessonPlan.save();
        res.status(201).json({ message: "Lesson Plan created successfully", data: newLessonPlan });
    } catch (error) {
        res.status(500).json({ message: "Error creating lesson plan", error: error.message });
    }
};

// Get All Lesson Plans
export const getAllLessonPlans = async (req, res) => {
    try {
        const { class_id, week_number, year, status } = req.query;
        const query = { isActive: true };

        if (class_id) query.class_id = class_id;
        if (week_number) query.week_number = week_number;
        if (year) query.year = year;
        if (status) query.status = status;

        const lessonPlans = await LessonPlan.find(query).sort({ createdAt: -1 });
        res.status(200).json({ data: lessonPlans });
    } catch (error) {
        res.status(500).json({ message: "Error fetching lesson plans", error: error.message });
    }
};

// Get Lesson Plan by ID
export const getLessonPlanById = async (req, res) => {
    try {
        const lessonPlan = await LessonPlan.findById(req.params.id);
        if (!lessonPlan) {
            return res.status(404).json({ message: "Lesson Plan not found" });
        }
        res.status(200).json({ data: lessonPlan });
    } catch (error) {
        res.status(500).json({ message: "Error fetching lesson plan", error: error.message });
    }
};

// Update Lesson Plan
export const updateLessonPlan = async (req, res) => {
    try {
        const updatedLessonPlan = await LessonPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedLessonPlan) {
            return res.status(404).json({ message: "Lesson Plan not found" });
        }

        res.status(200).json({ message: "Lesson Plan updated successfully", data: updatedLessonPlan });
    } catch (error) {
        res.status(500).json({ message: "Error updating lesson plan", error: error.message });
    }
};

// Delete Lesson Plan (Soft Delete)
export const deleteLessonPlan = async (req, res) => {
    try {
        const lessonPlan = await LessonPlan.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!lessonPlan) {
            return res.status(404).json({ message: "Lesson Plan not found" });
        }

        res.status(200).json({ message: "Lesson Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting lesson plan", error: error.message });
    }
};
