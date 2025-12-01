import ExamSchedule from "../Models/examSchedule.js";
import Class from "../Models/class.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";
import { sendAnnouncementEmail } from "../Utlis/notificationService.js";

// Create new exam schedule
const createExamSchedule = async (req, res) => {
  try {
    const {
      exam_name,
      class_id,
      subject,
      exam_date,
      start_time,
      end_time,
      duration,
      total_marks,
      passing_marks,
      exam_type,
    } = req.body;

    // Validate required fields
    if (!exam_name || !class_id || !subject || !exam_date || !start_time || !end_time || !duration) {
      return errorHandler(res, 400, "Missing required fields");
    }

    // Verify class exists
    const classData = await Class.findById(class_id);
    if (!classData) {
      return errorHandler(res, 404, "Class not found");
    }

    // Create exam schedule
    const examSchedule = new ExamSchedule({
      exam_name,
      class_id,
      class_name: classData.class_name,
      subject,
      exam_date,
      start_time,
      end_time,
      duration,
      total_marks: total_marks || 100,
      passing_marks: passing_marks || 40,
      exam_type: exam_type || "final",
      created_by: req.user?._id,
    });

    await examSchedule.save();
    
    // Send exam notification to students in the class
    try {
      await sendAnnouncementEmail({
        title: `Exam Scheduled: ${exam_name}`,
        content: `An exam "${exam_name}" has been scheduled for ${subject}. Date: ${new Date(exam_date).toLocaleDateString()} from ${start_time} to ${end_time}. Duration: ${duration} minutes. Total Marks: ${total_marks}`,
        targetAudience: `class_${class_id}`
      });
    } catch (notificationError) {
      console.error("Failed to send exam notification:", notificationError);
      // Don't fail the exam creation if notification fails
    }
    
    return successHandler(res, 201, "Exam schedule created successfully", examSchedule);
  } catch (error) {
    return errorHandler(res, 500, "Error creating exam schedule", error.message);
  }
};

// Get all exam schedules with filters
const getAllExamSchedules = async (req, res) => {
  try {
    const { class_id, exam_date, status, exam_type, isActive } = req.query;

    // Build filter object
    const filter = {};
    if (class_id) filter.class_id = class_id;
    if (exam_date) {
      const date = new Date(exam_date);
      filter.exam_date = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }
    if (status) filter.status = status;
    if (exam_type) filter.exam_type = exam_type;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const examSchedules = await ExamSchedule.find(filter)
      .populate("class_id", "class_name teacher_assigned")
      .sort({ exam_date: 1, start_time: 1 });

    return successHandler(
      res,
      200,
      "Exam schedules retrieved successfully",
      examSchedules
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving exam schedules", error.message);
  }
};

// Get exam schedule by ID
const getExamScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const examSchedule = await ExamSchedule.findById(id).populate(
      "class_id",
      "class_name teacher_assigned students_enrolled"
    );

    if (!examSchedule) {
      return errorHandler(res, 404, "Exam schedule not found");
    }

    return successHandler(
      res,
      200,
      "Exam schedule retrieved successfully",
      examSchedule
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving exam schedule", error.message);
  }
};

// Update exam schedule
const updateExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If class_id is being updated, verify it exists and update class_name
    if (updateData.class_id) {
      const classData = await Class.findById(updateData.class_id);
      if (!classData) {
        return errorHandler(res, 404, "Class not found");
      }
      updateData.class_name = classData.class_name;
    }

    const examSchedule = await ExamSchedule.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("class_id", "class_name teacher_assigned");

    if (!examSchedule) {
      return errorHandler(res, 404, "Exam schedule not found");
    }

    return successHandler(res, 200, "Exam schedule updated successfully", examSchedule);
  } catch (error) {
    return errorHandler(res, 500, "Error updating exam schedule", error.message);
  }
};

// Delete exam schedule
const deleteExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const examSchedule = await ExamSchedule.findByIdAndDelete(id);

    if (!examSchedule) {
      return errorHandler(res, 404, "Exam schedule not found");
    }

    return successHandler(res, 200, "Exam schedule deleted successfully");
  } catch (error) {
    return errorHandler(res, 500, "Error deleting exam schedule", error.message);
  }
};

// Update exam status
const updateExamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["scheduled", "ongoing", "completed", "cancelled"].includes(status)) {
      return errorHandler(res, 400, "Invalid status value");
    }

    const examSchedule = await ExamSchedule.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!examSchedule) {
      return errorHandler(res, 404, "Exam schedule not found");
    }

    return successHandler(
      res,
      200,
      `Exam status updated to ${status} successfully`,
      examSchedule
    );
  } catch (error) {
    return errorHandler(res, 500, "Error updating exam status", error.message);
  }
};

// Toggle active status
const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const examSchedule = await ExamSchedule.findById(id);

    if (!examSchedule) {
      return errorHandler(res, 404, "Exam schedule not found");
    }

    examSchedule.isActive = !examSchedule.isActive;
    await examSchedule.save();

    return successHandler(
      res,
      200,
      `Exam schedule ${examSchedule.isActive ? "activated" : "deactivated"} successfully`,
      examSchedule
    );
  } catch (error) {
    return errorHandler(res, 500, "Error toggling active status", error.message);
  }
};

// Get upcoming exams (next 7 days)
const getUpcomingExams = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingExams = await ExamSchedule.find({
      exam_date: { $gte: today, $lte: nextWeek },
      status: { $in: ["scheduled", "ongoing"] },
      isActive: true,
    })
      .populate("class_id", "class_name teacher_assigned")
      .sort({ exam_date: 1, start_time: 1 });

    return successHandler(
      res,
      200,
      "Upcoming exams retrieved successfully",
      upcomingExams
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving upcoming exams", error.message);
  }
};

// Get exams by class
const getExamsByClass = async (req, res) => {
  try {
    const { class_id } = req.params;

    const exams = await ExamSchedule.find({ class_id, isActive: true })
      .populate("class_id", "class_name teacher_assigned")
      .sort({ exam_date: -1 });

    return successHandler(
      res,
      200,
      "Class exams retrieved successfully",
      exams
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving class exams", error.message);
  }
};

export default {
  createExamSchedule,
  getAllExamSchedules,
  getExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
  updateExamStatus,
  toggleActiveStatus,
  getUpcomingExams,
  getExamsByClass,
};
