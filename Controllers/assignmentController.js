import Assignment from "../Models/assignment.js";
import Class from "../Models/class.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

// Create Assignment
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      class_id,
      subject,
      due_date,
      end_time,
      total_marks,
      week_number,
      year,
      attachments,
      questions,
    } = req.body;

    // Validate class exists
    const classExists = await Class.findById(class_id);
    if (!classExists) {
      return errorHandler(res, 404, "Class not found");
    }

    // Validate questions if provided
    if (questions && questions.length > 0) {
      for (const question of questions) {
        if (!question.question_text || !question.question_type || !question.marks) {
          return errorHandler(res, 400, "Invalid question format");
        }
        
        if (question.question_type === "multiple_choice" && (!question.options || question.options.length < 2)) {
          return errorHandler(res, 400, "Multiple choice questions must have at least 2 options");
        }
        
        if (question.question_type === "true_false" && (!question.options || question.options.length !== 2)) {
          return errorHandler(res, 400, "True/False questions must have exactly 2 options");
        }
      }
    }

    // Check if assignment already exists for this week
    const existingAssignment = await Assignment.findOne({
      class_id,
      week_number,
      year,
      isActive: true,
    });

    if (existingAssignment) {
      return errorHandler(
        res,
        400,
        "Assignment already exists for this class and week"
      );
    }

    const assignment = new Assignment({
      title,
      description,
      class_id,
      class_name: classExists.class_name,
      subject,
      due_date,
      end_time,
      total_marks,
      week_number,
      year,
      attachments: attachments || [],
      questions: questions || [],
      created_by: req.user.id,
    });

    await assignment.save();
    successHandler(res, 201, "Assignment created successfully", assignment);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get All Assignments with filters
const getAllAssignments = async (req, res) => {
  try {
    const { class_id, status, week_number, year, isActive } = req.query;
    const filter = {};

    if (class_id) filter.class_id = class_id;
    if (status) filter.status = status;
    if (week_number) filter.week_number = parseInt(week_number);
    if (year) filter.year = parseInt(year);
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const assignments = await Assignment.find(filter)
      .populate("class_id", "class_name teacher_assigned")
      .populate("created_by", "name email")
      .sort({ due_date: -1 });

    successHandler(res, 200, "Assignments fetched successfully", assignments);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Assignment by ID
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate("class_id", "class_name teacher_assigned")
      .populate("created_by", "name email");

    if (!assignment) {
      return errorHandler(res, 404, "Assignment not found");
    }

    successHandler(res, 200, "Assignment fetched successfully", assignment);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Update Assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      class_id,
      subject,
      due_date,
      end_time,
      total_marks,
      week_number,
      year,
      attachments,
      questions,
      status
    } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return errorHandler(res, 404, "Assignment not found");
    }

    // Validate questions if provided
    if (questions && questions.length > 0) {
      for (const question of questions) {
        if (!question.question_text || !question.question_type || !question.marks) {
          return errorHandler(res, 400, "Invalid question format");
        }
        
        if (question.question_type === "multiple_choice" && (!question.options || question.options.length < 2)) {
          return errorHandler(res, 400, "Multiple choice questions must have at least 2 options");
        }
        
        if (question.question_type === "true_false" && (!question.options || question.options.length !== 2)) {
          return errorHandler(res, 400, "True/False questions must have exactly 2 options");
        }
      }
    }

    // If class_id is being updated, validate it
    if (class_id && class_id !== assignment.class_id.toString()) {
      const classExists = await Class.findById(class_id);
      if (!classExists) {
        return errorHandler(res, 404, "Class not found");
      }
      assignment.class_name = classExists.class_name;
    }

    // Update fields
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (class_id) assignment.class_id = class_id;
    if (subject) assignment.subject = subject;
    if (due_date) assignment.due_date = due_date;
    if (end_time) assignment.end_time = end_time;
    if (total_marks !== undefined) assignment.total_marks = total_marks;
    if (week_number) assignment.week_number = week_number;
    if (year) assignment.year = year;
    if (attachments) assignment.attachments = attachments;
    if (questions !== undefined) assignment.questions = questions;
    if (status) assignment.status = status;

    await assignment.save();
    successHandler(res, 200, "Assignment updated successfully", assignment);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Delete Assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return errorHandler(res, 404, "Assignment not found");
    }

    successHandler(res, 200, "Assignment deleted successfully", null);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Update Assignment Status
const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "closed"].includes(status)) {
      return errorHandler(res, 400, "Invalid status");
    }

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!assignment) {
      return errorHandler(res, 404, "Assignment not found");
    }

    successHandler(res, 200, "Assignment status updated successfully", assignment);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Toggle Active Status
const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return errorHandler(res, 404, "Assignment not found");
    }

    assignment.isActive = !assignment.isActive;
    await assignment.save();

    successHandler(
      res,
      200,
      `Assignment ${assignment.isActive ? "activated" : "deactivated"} successfully`,
      assignment
    );
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Assignments by Class
const getAssignmentsByClass = async (req, res) => {
  try {
    const { class_id } = req.params;

    const assignments = await Assignment.find({
      class_id,
      isActive: true,
    })
      .populate("created_by", "name email")
      .sort({ due_date: -1 });

    successHandler(res, 200, "Class assignments fetched successfully", assignments);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Current Week's Assignments (for reminder system)
const getCurrentWeekAssignments = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    const assignments = await Assignment.find({
      week_number: currentWeek,
      year: currentYear,
      isActive: true,
    })
      .populate("class_id", "class_name")
      .populate("created_by", "name email");

    successHandler(
      res,
      200,
      "Current week assignments fetched successfully",
      assignments
    );
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Missing Assignments (classes without assignments for current week)
const getMissingAssignments = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    // Get all active classes
    const activeClasses = await Class.find({ isActive: true });

    // Get assignments for current week
    const currentWeekAssignments = await Assignment.find({
      week_number: currentWeek,
      year: currentYear,
      isActive: true,
    });

    // Find classes without assignments
    const classesWithAssignments = currentWeekAssignments.map((a) =>
      a.class_id.toString()
    );
    const missingClasses = activeClasses.filter(
      (c) => !classesWithAssignments.includes(c._id.toString())
    );

    successHandler(
      res,
      200,
      "Missing assignments fetched successfully",
      {
        week_number: currentWeek,
        year: currentYear,
        missing_count: missingClasses.length,
        classes: missingClasses,
      }
    );
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export default {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  toggleActiveStatus,
  getAssignmentsByClass,
  getCurrentWeekAssignments,
  getMissingAssignments,
};
