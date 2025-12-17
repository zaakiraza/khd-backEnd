import user from "../Models/user.js";
import User from "../Models/user.js";
import Class from "../Models/class.js";
import Session from "../Models/session.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return errorHandler(res, 400, "User ID not found in token");
    }
    const userData = await User.findOne({ _id: userId })
      .populate({
        path: 'class_history.class_name',
        select: 'class_name'
      })
      .populate({
        path: 'class_history.session',
        select: 'session_name'
      })
      .select(
        "-__v -createdAt -updatedAt -personal_info.password -personal_info.otp -personal_info.otpExpiresAt -personal_info.isAdmin"
      );
    if (!userData) {
      return errorHandler(res, 404, "User not found");
    }
    return successHandler(res, 200, "User retrieved successfully", userData, 1);
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving user", error.message);
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return errorHandler(res, 400, "User ID is required");
    }
    const userData = await User.findOne({ _id: userId }).select(
      "-__v -createdAt -updatedAt -personal_info.password -personal_info.otp -personal_info.otpExpiresAt -personal_info.isAdmin"
    );
    if (!userData) {
      return errorHandler(res, 404, "User not found");
    }
    return successHandler(res, 200, "User retrieved successfully", userData, 1);
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving user", error.message);
  }
};

const getAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const enrolled_year = req.query.enrolled_year;
    const enrolled_class = req.query.enrolled_class;
    const verified = req.query.verified;
    const status = req.query.status;
    const application_status = req.query.application_status;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    const filter = {};
    if (enrolled_year && enrolled_year !== "null") {
      filter["personal_info.enrolled_year"] = enrolled_year;
    }
    if (enrolled_class) {
      // If enrolled_class is "null", filter for users with empty or null class_history
      if (!enrolled_class) {
        filter.$or = [
          { class_history: { $exists: false } },
          { class_history: { $eq: null } },
          { class_history: { $size: 0 } }
        ];
      } else {
        filter["personal_info.enrolled_class"] = enrolled_class;
      }
    }
    if (verified && verified !== "null") {
      filter["personal_info.verified"] = verified;
    }
    if (status && status !== "null") {
      filter["personal_info.status"] = status;
    }
    if (application_status && application_status !== "null") {
      filter["personal_info.application_status"] = application_status;
    }
    if (search) {
      filter.$or = [
        { "personal_info.first_name": { $regex: search, $options: "i" } },
        { "personal_info.last_name": { $regex: search, $options: "i" } },
        { "personal_info.email": { $regex: search, $options: "i" } },
        // { "personal_info.CNIC": { $regex: search, $options: "i" } },
        { "personal_info.alternative_no": { $regex: search, $options: "i" } },
        { "personal_info.whatsapp_no": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select(
        "-__v -createdAt -updatedAt -personal_info.password -personal_info.otp -personal_info.otpExpiresAt -personal_info.isAdmin"
      )
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    if (users.length === 0) {
      return errorHandler(res, 404, "No users found");
    }

    const response = {
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    };

    return successHandler(
      res,
      200,
      "Users retrieved successfully",
      response,
      totalUsers
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving users", error.message);
  }
};

const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    return successHandler(
      res,
      200,
      "User count retrieved successfully",
      null,
      count
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving user count", error.message);
  }
};

const getActiveUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const enrolled_class = req.query.enrolled_class;
    const skip = (page - 1) * limit;

    const filter = {
      "personal_info.status": "active",
      "personal_info.application_status": "accepted",
    };

    if (enrolled_class && enrolled_class !== "null") {
      filter["personal_info.enrolled_class"] = enrolled_class;
    }

    const users = await User.find(filter)
      .select(
        "-__v -createdAt -updatedAt -personal_info.password -personal_info.otp -personal_info.otpExpiresAt -personal_info.isAdmin"
      )
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    if (users.length === 0) {
      return errorHandler(res, 404, "No users found");
    }

    const response = {
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    };

    return successHandler(res, 200, "Users retrieved successfully", response);
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving users", error.message);
  }
};

const getPendingUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({
      "personal_info.application_status": "pending",
    })
      .select(
        "-__v -createdAt -updatedAt -personal_info.password -personal_info.otp -personal_info.otpExpiresAt -personal_info.isAdmin"
      )
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({
      "personal_info.application_status": "pending",
    });
    const totalPages = Math.ceil(totalUsers / limit);

    if (users.length === 0) {
      return errorHandler(res, 404, "No users found");
    }

    const response = {
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    };

    return successHandler(res, 200, "Users retrieved successfully", response);
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving users", error.message);
  }
};

const update_user = async (req, res) => {
  // const userId = req.user.userId;
  const userId = req.params.id
  const {
    personal_info,
    guardian_info,
    academic_progress,
    previous_madrassa,
    bank_info,
  } = req.body;
  try {
    if (!personal_info || !academic_progress || !guardian_info || !bank_info) {
      return errorHandler(
        res,
        400,
        "Personal info, academic progress, guardian info and bank info are required"
      );
    }
    if (!previous_madrassa) {
      previous_madrassa.name = "";
      previous_madrassa.topic = "";
    }

    const {
      first_name,
      last_name,
      father_name,
      gender,
      whatsapp_no,
      dob,
      age,
      alternative_no,
      address,
      city,
      country,
      img_URL,
      doc_img,
      marj_e_taqleed,
    } = personal_info;

    if (
      !first_name ||
      !last_name ||
      !father_name ||
      !gender ||
      !alternative_no ||
      !whatsapp_no ||
      !dob ||
      !age ||
      !address ||
      !city ||
      !country ||
      !img_URL ||
      !doc_img ||
      !marj_e_taqleed
    ) {
      return errorHandler(res, 400, "All personal info fields are required");
    }

    if (age > 19 || age < 9) {
      return errorHandler(res, 400, "Age is not according to our school");
    }

    const { academic_class, institute_name, inProgress, result } =
      academic_progress;
    if (!academic_class || !institute_name || inProgress) {
      return errorHandler(
        res,
        400,
        "All academic progress fields are required"
      );
    }

    if (
      !guardian_info.name ||
      !guardian_info.relationship ||
      !guardian_info.email ||
      !guardian_info.whatsapp_no ||
      !guardian_info.address ||
      !guardian_info.CNIC
    ) {
      return errorHandler(res, 404, "All Guardian Info fields are required");
    }

    if (
      !bank_info.bank_name ||
      !bank_info.account_number ||
      !bank_info.account_title ||
      !bank_info.branch
    ) {
      return errorHandler(res, 404, "All Bank Info fields are required");
    }

    if (!previous_madrassa.name || !previous_madrassa.topic) {
      return errorHandler(
        res,
        404,
        "All Previous Madrassa fields are required"
      );
    }

    // Build $set fields with dot-notation so we don't overwrite the entire nested objects
    const setFields = {
      "personal_info.first_name": first_name,
      "personal_info.last_name": last_name,
      "personal_info.father_name": father_name,
      "personal_info.gender": gender,
      "personal_info.whatsapp_no": whatsapp_no,
      "personal_info.alternative_no": alternative_no,
      "personal_info.dob": dob,
      "personal_info.age": age,
      "personal_info.address": address,
      "personal_info.city": city,
      "personal_info.country": country,
      "personal_info.img_URL": img_URL,
      "personal_info.doc_img": doc_img,
      "personal_info.alternative_no": alternative_no,
      "personal_info.marj_e_taqleed": marj_e_taqleed,
      "academic_progress.academic_class": academic_class,
      "academic_progress.institute_name": institute_name,
      "academic_progress.inProgress": inProgress,
      "academic_progress.result": result,
      "guardian_info.name": guardian_info.name,
      "guardian_info.relationship": guardian_info.relationship,
      "guardian_info.email": guardian_info.email,
      "guardian_info.whatsapp_no": guardian_info.whatsapp_no,
      "guardian_info.address": guardian_info.address,
      "guardian_info.CNIC": guardian_info.CNIC,
      "bank_info.bank_name": bank_info.bank_name,
      "bank_info.account_number": bank_info.account_number,
      "bank_info.account_title": bank_info.account_title,
      "bank_info.branch": bank_info.branch,
      "previous_madrassa.name": previous_madrassa.name,
      "previous_madrassa.topic": previous_madrassa.topic,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: setFields },
      { new: true }
    );
    if (!updatedUser) {
      return errorHandler(res, 404, "User not found");
    }

    return successHandler(
      res,
      200,
      "User personal information updated successfully",
      {
        personal_info: updatedUser.personal_info,
        guardian_info: updatedUser.guardian_info,
        academic_progress: updatedUser.academic_progress,
        previous_madrassa: updatedUser.previous_madrassa,
        bank_info: updatedUser.bank_info,
      },
      1
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error updating user personal information",
      error.message
    );
  }
};

// Helper function to update class student count
const updateClassStudentCount = async (classId) => {
  try {
    const studentCount = await User.countDocuments({
      "personal_info.verified": true,
      "personal_info.status": "active",
      "personal_info.application_status": "accepted",
      "class_history": {
        $elemMatch: {
          class_name: classId,
          status: { $in: ["inprogress", "active"] }
        }
      }
    });

    await Class.findByIdAndUpdate(classId, {
      students_enrolled: studentCount
    });
  } catch (error) {
    console.error("Error updating class student count:", error);
  }
};

const update_class_history = async (req, res) => {
  const { id } = req.params;
  const {
    class_name,
    year,
    status,
    session,
    result,
    repeat_count,
    isCompleted,
  } = req.body;

  try {
    if (
      !class_name ||
      !year ||
      !status ||
      !session ||
      isCompleted === undefined
    ) {
      return errorHandler(res, 400, "Missing required fields");
    }

    // If class_name is a string, find the Class ObjectId
    let classId = class_name;
    let classNameString = class_name;
    if (typeof class_name === 'string' && !class_name.match(/^[0-9a-fA-F]{24}$/)) {
      const classDoc = await Class.findOne({ class_name: class_name });
      if (!classDoc) {
        return errorHandler(res, 404, `Class '${class_name}' not found`);
      }
      classId = classDoc._id;
      classNameString = classDoc.class_name;
    } else {
      // If ObjectId was provided, fetch the class name
      const classDoc = await Class.findById(class_name);
      if (!classDoc) {
        return errorHandler(res, 404, `Class not found`);
      }
      classNameString = classDoc.class_name;
    }

    // If session is a string, find the Session ObjectId
    let sessionId = session;
    if (typeof session === 'string' && !session.match(/^[0-9a-fA-F]{24}$/)) {
      const sessionDoc = await Session.findOne({ session_name: session });
      if (!sessionDoc) {
        return errorHandler(res, 404, `Session '${session}' not found`);
      }
      sessionId = sessionDoc._id;
    }

    // Update both class_history and enrolled_class in one operation
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push: {
          class_history: {
            class_name: classId,
            year,
            status,
            session: sessionId,
            result,
            repeat_count,
            isCompleted,
          },
        },
        $set: {
          "personal_info.enrolled_class": classNameString,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return errorHandler(res, 404, "User not found");
    }

    // Update the class student count
    await updateClassStudentCount(classId);

    return successHandler(
      res,
      200,
      "User class history updated successfully",
      updatedUser.class_history,
      1
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error updating user class history",
      error.message
    );
  }
};

const update_application_status = async (req, res) => {
  const { id } = req.params;
  const { application_status } = req.body;

  try {
    if (!application_status) {
      return errorHandler(res, 400, "Application status is required");
    }

    if (!["pending", "accepted", "rejected"].includes(application_status)) {
      return errorHandler(res, 400, "Invalid application status");
    }

    // Get user's current class before updating
    const currentUser = await User.findById(id);
    const currentClassId = currentUser?.class_history?.find(ch => ch.status === "inprogress")?.class_name;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          "personal_info.application_status": application_status,
          "personal_info.status": application_status === "accepted" ? "active" : "inactive",
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return errorHandler(res, 404, "User not found");
    }

    // Update class student count if user has a class
    if (currentClassId) {
      await updateClassStudentCount(currentClassId);
    }

    return successHandler(
      res,
      200,
      "Application status updated successfully",
      {
        _id: updatedUser._id,
        application_status: updatedUser.personal_info.application_status,
      },
      1
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error updating application status",
      error.message
    );
  }
};

// Get students by class and result status (pass/fail/inprogress)
const getStudentsByClassResult = async (req, res) => {
  try {
    const { class_name, result_status } = req.query;

    if (!class_name) {
      return errorHandler(res, 400, "Class name is required");
    }

    // Find the class to get its ID
    const classDoc = await Class.findOne({ class_name });
    if (!classDoc) {
      return errorHandler(res, 404, `Class '${class_name}' not found`);
    }

    // Build the query based on result_status
    let statusFilter;
    if (result_status === "passed") {
      statusFilter = { status: "pass" };
    } else if (result_status === "failed") {
      statusFilter = { status: { $in: ["fail", "inprogress"] } };
    } else {
      statusFilter = {};
    }

    // Find students with the specified class in their class_history
    const students = await User.find({
      "personal_info.verified": true,
      "personal_info.status": "active",
      "personal_info.application_status": "accepted",
      "personal_info.enrolled_class": class_name,
      class_history: {
        $elemMatch: {
          class_name: classDoc._id,
          ...statusFilter,
        },
      },
    })
      .select("-personal_info.password -personal_info.otp -personal_info.otpExpiresAt")
      .sort({ "personal_info.rollNo": 1 });

    // Add current class history info to each student
    const studentsWithCurrentClass = students.map((student) => {
      const currentClassHistory = student.class_history.find(
        (ch) => ch.class_name.toString() === classDoc._id.toString()
      );
      return {
        ...student.toObject(),
        currentClassHistory,
      };
    });

    return successHandler(
      res,
      200,
      "Students retrieved successfully",
      studentsWithCurrentClass,
      studentsWithCurrentClass.length
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving students", error.message);
  }
};

// Bulk promote students to next class
const promoteStudents = async (req, res) => {
  try {
    const { student_ids, from_class, to_class, year, session } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return errorHandler(res, 400, "Student IDs array is required");
    }

    if (!from_class || !to_class || !year || !session) {
      return errorHandler(res, 400, "Missing required fields: from_class, to_class, year, session");
    }

    // Get class documents
    const fromClassDoc = await Class.findOne({ class_name: from_class });
    const toClassDoc = await Class.findOne({ class_name: to_class });
    
    if (!fromClassDoc || !toClassDoc) {
      return errorHandler(res, 404, "Class not found");
    }

    // Get session document
    const sessionDoc = await Session.findOne({ session_name: session });
    if (!sessionDoc) {
      return errorHandler(res, 404, `Session '${session}' not found`);
    }

    const results = {
      promoted: [],
      failed: [],
    };

    for (const studentId of student_ids) {
      try {
        const student = await User.findById(studentId);
        if (!student) {
          results.failed.push({ id: studentId, reason: "Student not found" });
          continue;
        }

        // Mark old class as completed
        const classHistoryIndex = student.class_history.findIndex(
          (ch) => ch.class_name.toString() === fromClassDoc._id.toString() && ch.status === "pass"
        );

        if (classHistoryIndex !== -1) {
          student.class_history[classHistoryIndex].isCompleted = true;
        }

        // Add new class to history
        student.class_history.push({
          class_name: toClassDoc._id,
          year,
          session: sessionDoc._id,
          status: "inprogress",
          result: null,
          repeat_count: 0,
          isCompleted: false,
        });

        // Update enrolled_class
        student.personal_info.enrolled_class = to_class;

        await student.save();
        results.promoted.push(studentId);
      } catch (err) {
        results.failed.push({ id: studentId, reason: err.message });
      }
    }

    // Update class student counts
    await updateClassStudentCount(fromClassDoc._id);
    await updateClassStudentCount(toClassDoc._id);

    return successHandler(
      res,
      200,
      `Successfully promoted ${results.promoted.length} student(s)`,
      results
    );
  } catch (error) {
    return errorHandler(res, 500, "Error promoting students", error.message);
  }
};

// Update student's class status (for editing failed students)
const updateClassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_name, status, result, repeat_count, isCompleted } = req.body;

    if (!class_name || !status) {
      return errorHandler(res, 400, "Class name and status are required");
    }

    // Find the class
    const classDoc = await Class.findOne({ class_name });
    if (!classDoc) {
      return errorHandler(res, 404, `Class '${class_name}' not found`);
    }

    const student = await User.findById(id);
    if (!student) {
      return errorHandler(res, 404, "Student not found");
    }

    // Find and update the class history entry
    const classHistoryIndex = student.class_history.findIndex(
      (ch) => ch.class_name.toString() === classDoc._id.toString()
    );

    if (classHistoryIndex === -1) {
      return errorHandler(res, 404, "Class history entry not found for this student");
    }

    // Update the class history entry
    student.class_history[classHistoryIndex].status = status;
    if (result !== undefined) {
      student.class_history[classHistoryIndex].result = result;
    }
    if (repeat_count !== undefined) {
      student.class_history[classHistoryIndex].repeat_count = repeat_count;
    }
    if (isCompleted !== undefined) {
      student.class_history[classHistoryIndex].isCompleted = isCompleted;
    }

    await student.save();

    return successHandler(
      res,
      200,
      "Student class status updated successfully",
      student.class_history[classHistoryIndex]
    );
  } catch (error) {
    return errorHandler(res, 500, "Error updating class status", error.message);
  }
};

export default {
  getCurrentUser,
  getUser,
  getAllUser,
  getUserCount,
  getActiveUser,
  getPendingUser,
  update_user,
  update_class_history,
  update_application_status,
  getStudentsByClassResult,
  promoteStudents,
  updateClassStatus,
};
