import Attendance from "../Models/attendance.js";
import Class from "../Models/class.js";
import User from "../Models/user.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

// Create or update attendance for a class on a specific date
const markAttendance = async (req, res) => {
  try {
    const { class_id, class_name, date, attendance } = req.body;
    const marked_by = req.user.id;

    // Validation
    if (!class_id || !class_name || !date || !attendance || !Array.isArray(attendance)) {
      return errorHandler(res, 400, "Missing required fields");
    }

    if (attendance.length === 0) {
      return errorHandler(res, 400, "No attendance records provided");
    }

    // Validate date is not in the future
    const attendanceDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (attendanceDate > today) {
      return errorHandler(res, 400, "Cannot mark attendance for future dates");
    }

    // Calculate statistics
    const total_students = attendance.length;
    const total_present = attendance.filter((a) => a.status === "present").length;
    const total_absent = attendance.filter((a) => a.status === "absent").length;
    const total_late = attendance.filter((a) => a.status === "late").length;
    const total_leave = attendance.filter((a) => a.status === "leave").length;

    // Prepare attendance records with student details
    const attendance_records = await Promise.all(
      attendance.map(async (record) => {
        const student = await User.findById(record.student_id).select("personal_info");
        return {
          student_id: record.student_id,
          student_name: `${student.personal_info.first_name} ${student.personal_info.last_name}`,
          roll_no: student.personal_info.rollNo,
          status: record.status,
          marked_at: new Date(),
        };
      })
    );

    // Check if attendance already exists for this class and date
    const existingAttendance = await Attendance.findOne({
      class_id,
      date: attendanceDate,
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.attendance_records = attendance_records;
      existingAttendance.marked_by = marked_by;
      existingAttendance.total_students = total_students;
      existingAttendance.total_present = total_present;
      existingAttendance.total_absent = total_absent;
      existingAttendance.total_late = total_late;
      existingAttendance.total_leave = total_leave;

      await existingAttendance.save();

      return successHandler(
        res,
        200,
        "Attendance updated successfully",
        existingAttendance
      );
    } else {
      // Create new attendance
      const newAttendance = new Attendance({
        class_id,
        class_name,
        date: attendanceDate,
        attendance_records,
        marked_by,
        total_students,
        total_present,
        total_absent,
        total_late,
        total_leave,
      });

      await newAttendance.save();

      return successHandler(
        res,
        201,
        "Attendance marked successfully",
        newAttendance
      );
    }
  } catch (error) {
    if (error.code === 11000) {
      return errorHandler(
        res,
        400,
        "Attendance already exists for this class and date"
      );
    }
    return errorHandler(res, 500, "Error marking attendance", error.message);
  }
};

// Get attendance by class and date
const getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { class_id, date } = req.query;

    if (!class_id || !date) {
      return errorHandler(res, 400, "Class ID and date are required");
    }

    const attendance = await Attendance.findOne({
      class_id,
      date: new Date(date),
    })
      .populate("marked_by", "personal_info.first_name personal_info.last_name")
      .populate("attendance_records.student_id", "personal_info");

    if (!attendance) {
      return errorHandler(res, 404, "Attendance not found");
    }

    return successHandler(
      res,
      200,
      "Attendance retrieved successfully",
      attendance
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving attendance", error.message);
  }
};

// Get attendance by class for a date range
const getAttendanceByClass = async (req, res) => {
  try {
    const { class_id, start_date, end_date } = req.query;

    if (!class_id) {
      return errorHandler(res, 400, "Class ID is required");
    }

    const query = { class_id };

    if (start_date && end_date) {
      query.date = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      };
    } else if (start_date) {
      query.date = { $gte: new Date(start_date) };
    } else if (end_date) {
      query.date = { $lte: new Date(end_date) };
    }

    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .populate("marked_by", "personal_info.first_name personal_info.last_name");

    return successHandler(
      res,
      200,
      "Attendance records retrieved successfully",
      attendanceRecords
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error retrieving attendance records",
      error.message
    );
  }
};

// Get attendance by student
const getAttendanceByStudent = async (req, res) => {
  try {
    const { student_id, start_date, end_date } = req.query;

    if (!student_id) {
      return errorHandler(res, 400, "Student ID is required");
    }

    const query = {
      "attendance_records.student_id": student_id,
    };

    if (start_date && end_date) {
      query.date = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .select("date class_name attendance_records");

    // Filter to include only the specific student's record
    const filteredRecords = attendanceRecords.map((record) => ({
      date: record.date,
      class_name: record.class_name,
      status: record.attendance_records.find(
        (ar) => ar.student_id.toString() === student_id
      )?.status,
    }));

    return successHandler(
      res,
      200,
      "Student attendance retrieved successfully",
      filteredRecords
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error retrieving student attendance",
      error.message
    );
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAttendance = await Attendance.findByIdAndDelete(id);

    if (!deletedAttendance) {
      return errorHandler(res, 404, "Attendance record not found");
    }

    return successHandler(
      res,
      200,
      "Attendance record deleted successfully",
      deletedAttendance
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error deleting attendance record",
      error.message
    );
  }
};

// Get attendance statistics for a class
const getAttendanceStats = async (req, res) => {
  try {
    const { class_id, start_date, end_date } = req.query;

    if (!class_id) {
      return errorHandler(res, 400, "Class ID is required");
    }

    const query = { class_id };

    if (start_date && end_date) {
      query.date = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      };
    }

    const records = await Attendance.find(query);

    const stats = {
      total_days: records.length,
      total_present: records.reduce((sum, r) => sum + r.total_present, 0),
      total_absent: records.reduce((sum, r) => sum + r.total_absent, 0),
      total_late: records.reduce((sum, r) => sum + r.total_late, 0),
      total_leave: records.reduce((sum, r) => sum + r.total_leave, 0),
    };

    return successHandler(
      res,
      200,
      "Attendance statistics retrieved successfully",
      stats
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error retrieving attendance statistics",
      error.message
    );
  }
};

export {
  markAttendance,
  getAttendanceByClassAndDate,
  getAttendanceByClass,
  getAttendanceByStudent,
  deleteAttendance,
  getAttendanceStats,
};
