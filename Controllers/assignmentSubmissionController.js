import AssignmentSubmission from "../Models/assignmentSubmission.js";
import Assignment from "../Models/assignment.js";
import User from "../Models/user.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

// Submit assignment
const submitAssignment = async (req, res) => {
  try {
    const { assignment_id, answers, attachments } = req.body;
    const student_id = req.user.userId;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignment_id);
    if (!assignment) {
      return errorHandler(res, 404, "Assignment not found");
    }

    // Check if assignment is published
    if (assignment.status !== "published") {
      return errorHandler(res, 400, "Assignment is not available for submission");
    }

    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({
      assignment_id,
      student_id,
      isActive: true,
    });
    if (existingSubmission) {
      return errorHandler(res, 400, "Assignment already submitted");
    }

    // Get student details
    const student = await User.findById(student_id);
    const studentName = `${student.personal_info.first_name} ${student.personal_info.last_name}`;

    // Check if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const [hours, minutes] = assignment.end_time.split(":");
    dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const isLate = now > dueDate;

    // Auto-grade multiple choice and true/false questions
    let totalMarksObtained = 0;
    const gradedAnswers = answers.map((answer) => {
      const question = assignment.questions.find(
        (q) => q._id.toString() === answer.question_id
      );

      if (!question) return answer;

      let isCorrect = false;
      let marksObtained = 0;

      if (question.question_type === "multiple_choice") {
        const selectedOption = question.options.find(
          (opt) => opt._id.toString() === answer.selected_option
        );
        isCorrect = selectedOption?.is_correct || false;
        marksObtained = isCorrect ? question.marks : 0;
      } else if (question.question_type === "true_false") {
        isCorrect =
          answer.answer.toLowerCase() === question.correct_answer.toLowerCase();
        marksObtained = isCorrect ? question.marks : 0;
      }

      totalMarksObtained += marksObtained;

      return {
        ...answer,
        is_correct: isCorrect,
        marks_obtained: marksObtained,
      };
    });

    // Create submission
    const submission = new AssignmentSubmission({
      assignment_id,
      student_id,
      student_name: studentName,
      answers: gradedAnswers,
      attachments: attachments || [],
      status: isLate ? "late" : "submitted",
      total_marks_obtained: totalMarksObtained,
    });

    await submission.save();

    return successHandler(
      res,
      201,
      "Assignment submitted successfully",
      submission
    );
  } catch (error) {
    return errorHandler(res, 500, "Error submitting assignment", error.message);
  }
};

// Get student's submission for an assignment
const getMySubmission = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const student_id = req.user.userId;

    const submission = await AssignmentSubmission.findOne({
      assignment_id,
      student_id,
      isActive: true,
    }).populate("assignment_id", "title subject total_marks due_date");

    if (!submission) {
      return errorHandler(res, 404, "Submission not found");
    }

    return successHandler(
      res,
      200,
      "Submission retrieved successfully",
      submission
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving submission", error.message);
  }
};

// Get all submissions by student
const getMySubmissions = async (req, res) => {
  try {
    const student_id = req.user.userId;

    const submissions = await AssignmentSubmission.find({
      student_id,
      isActive: true,
    })
      .populate("assignment_id", "title subject total_marks due_date class_name")
      .sort({ submitted_at: -1 });

    return successHandler(
      res,
      200,
      "Submissions retrieved successfully",
      submissions,
      submissions.length
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error retrieving submissions",
      error.message
    );
  }
};

// Get all submissions for an assignment (Admin)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignment_id } = req.params;

    const submissions = await AssignmentSubmission.find({
      assignment_id,
      isActive: true,
    })
      .populate("student_id", "personal_info.first_name personal_info.last_name personal_info.email")
      .sort({ submitted_at: -1 });

    return successHandler(
      res,
      200,
      "Submissions retrieved successfully",
      submissions,
      submissions.length
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error retrieving submissions",
      error.message
    );
  }
};

// Grade submission (Admin)
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, total_marks_obtained, feedback } = req.body;
    const graded_by = req.user.userId;

    const submission = await AssignmentSubmission.findByIdAndUpdate(
      id,
      {
        answers,
        total_marks_obtained,
        feedback,
        status: "graded",
        graded_by,
        graded_at: new Date(),
      },
      { new: true }
    );

    if (!submission) {
      return errorHandler(res, 404, "Submission not found");
    }

    return successHandler(res, 200, "Submission graded successfully", submission);
  } catch (error) {
    return errorHandler(res, 500, "Error grading submission", error.message);
  }
};

export default {
  submitAssignment,
  getMySubmission,
  getMySubmissions,
  getAssignmentSubmissions,
  gradeSubmission,
};
