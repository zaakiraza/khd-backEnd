import Class from "../Models/class.js";
import User from "../Models/user.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

const addClass = async (req, res) => {
    try {
        const { class_name, teacher_assigned, class_timing, class_day } = req.body;
        if (!class_name) {
            return errorHandler(res, 400, "Class name is required");
        }
        const isClassExists = await Class.findOne({ class_name });
        if (isClassExists) {
            return errorHandler(res, 400, "Class with this name already exists");
        }
        const newClass = new Class({ class_name, teacher_assigned, class_timing, class_day });
        await newClass.save();
        return successHandler(res, 201, "Class added successfully");
    } catch (error) {
        return errorHandler(res, 500, "Error adding class", error.message);
    }
}

const getClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const classData = await Class.findById(classId).select("-__v -createdAt -updatedAt");
        if (!classData) {
            return errorHandler(res, 404, "Class not found");
        }
        return successHandler(res, 200, "Class retrieved successfully", classData, 1);
    } catch (error) {
        return errorHandler(res, 500, "Error retrieving class", error.message);
    }
}

const getAllClasses = async (req, res) => {
    try {
        const { isActive } = req.query;
        
        // Build filter object
        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        
        const classes = await Class.find(filter).select("-__v -createdAt -updatedAt");
        return successHandler(res, 200, "Classes retrieved successfully", classes);
    } catch (error) {
        return errorHandler(res, 500, "Error retrieving classes", error.message);
    }
}

const updateClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const { class_name, teacher_assigned, class_timing, class_day } = req.body;
        const updatedClass = await Class.findByIdAndUpdate(classId, { class_name, teacher_assigned, class_timing, class_day }, { new: true });
        if (!updatedClass) {
            return errorHandler(res, 404, "Class not found");
        }
        return successHandler(res, 200, "Class updated successfully", updatedClass);
    }
    catch (error) {
        return errorHandler(res, 400, "Error Updating Class")
    }
}

const deleteClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const deletedClass = await Class.findByIdAndDelete(classId);
        if (!deletedClass) {
            return errorHandler(res, 404, "Class not found");
        }
        return successHandler(res, 200, "Class deleted successfully", deletedClass);
    }
    catch (error) {
        return errorHandler(res, 400, "Error Deleting class")
    }
}

const inActiveClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const classData = await Class.findById(classId).select("-__v -createdAt -updatedAt");
        if (!classData) {
            return errorHandler(res, 404, "Class not found");
        }
        classData.isActive = false;
        await classData.save();
        return successHandler(res, 200, "Class deactivated successfully", classData, 1);
    } catch (error) {
        return errorHandler(res, 500, "Error deactivating class", error.message);
    }
}

const activeClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const classData = await Class.findById(classId).select("-__v -createdAt -updatedAt");
        if (!classData) {
            return errorHandler(res, 404, "Class not found");
        }
        classData.isActive = true;
        await classData.save();
        return successHandler(res, 200, "Class activated successfully", classData, 1);
    } catch (error) {
        return errorHandler(res, 500, "Error activating class", error.message);
    }
}

// Get enrolled students by class name or class ID
const getEnrolledStudents = async (req, res) => {
    try {
        const { class_name, class_id } = req.query;
        
        if (!class_name && !class_id) {
            return errorHandler(res, 400, "Either class_name or class_id is required");
        }

        let query = {
            status: "active",
            application_status: "accepted",
            verified: true
        };

        // If class_id is provided, first get the class_name
        if (class_id) {
            const classData = await Class.findById(class_id);
            if (!classData) {
                return errorHandler(res, 404, "Class not found");
            }
            query["personal_info.enrolled_class"] = classData.class_name;
        } else {
            query["personal_info.enrolled_class"] = class_name;
        }

        const students = await User.find(query)
            .select("personal_info")
            .sort({ "personal_info.rollNo": 1 });

        // Get class info for response
        let classInfo = null;
        if (class_id) {
            classInfo = await Class.findById(class_id).select("class_name teacher_assigned students_enrolled isActive");
        } else {
            classInfo = await Class.findOne({ class_name }).select("class_name teacher_assigned students_enrolled isActive");
        }

        return successHandler(res, 200, "Enrolled students retrieved successfully", {
            class: classInfo,
            total_students: students.length,
            students: students
        });
    } catch (error) {
        return errorHandler(res, 500, "Error retrieving enrolled students", error.message);
    }
}

export default {
    addClass,
    getClass,
    getAllClasses,
    updateClass,
    deleteClass,
    inActiveClass,
    activeClass,
    getEnrolledStudents
};