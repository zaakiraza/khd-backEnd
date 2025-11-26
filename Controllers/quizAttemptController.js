import QuizAttempt from "../Models/quizAttempt.js";
import Quiz from "../Models/quiz.js";
import User from "../Models/user.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

// Start quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const { quiz_id } = req.body;
    const student_id = req.user.userId;

    // Check if quiz exists
    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    // Check if quiz is published
    if (quiz.status !== "published") {
      return errorHandler(res, 400, "Quiz is not available");
    }

    // Check if already attempted
    const existingAttempt = await QuizAttempt.findOne({
      quiz_id,
      student_id,
      isActive: true,
    });
    if (existingAttempt) {
      return errorHandler(res, 400, "Quiz already attempted");
    }

    // Get student details
    const student = await User.findById(student_id);
    const studentName = `${student.personal_info.first_name} ${student.personal_info.last_name}`;

    // Create attempt
    const attempt = new QuizAttempt({
      quiz_id,
      student_id,
      student_name: studentName,
      status: "in_progress",
    });

    await attempt.save();

    return successHandler(
      res,
      201,
      "Quiz attempt started successfully",
      attempt
    );
  } catch (error) {
    return errorHandler(res, 500, "Error starting quiz attempt", error.message);
  }
};

// Submit quiz attempt
const submitQuizAttempt = async (req, res) => {
  try {
    const { quiz_id, answers, time_taken } = req.body;
    const student_id = req.user.userId;

    // Check if quiz exists
    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    // Find attempt
    let attempt = await QuizAttempt.findOne({
      quiz_id,
      student_id,
      isActive: true,
    });

    if (!attempt) {
      // Create new attempt if not exists
      const student = await User.findById(student_id);
      const studentName = `${student.personal_info.first_name} ${student.personal_info.last_name}`;
      
      attempt = new QuizAttempt({
        quiz_id,
        student_id,
        student_name: studentName,
      });
    }

    // Auto-grade multiple choice and true/false questions
    let totalMarksObtained = 0;
    const gradedAnswers = answers.map((answer) => {
      const question = quiz.questions.find(
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

    const percentage = (totalMarksObtained / quiz.total_marks) * 100;
    const passed = percentage >= quiz.passing_marks;

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.status = "submitted";
    attempt.submitted_at = new Date();
    attempt.total_marks_obtained = totalMarksObtained;
    attempt.percentage = percentage.toFixed(2);
    attempt.passed = passed;
    attempt.time_taken = time_taken || 0;

    await attempt.save();

    return successHandler(
      res,
      200,
      "Quiz submitted successfully",
      attempt
    );
  } catch (error) {
    return errorHandler(res, 500, "Error submitting quiz", error.message);
  }
};

// Get student's attempt for a quiz
const getMyAttempt = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const student_id = req.user.userId;

    const attempt = await QuizAttempt.findOne({
      quiz_id,
      student_id,
      isActive: true,
    }).populate("quiz_id", "title subject total_marks passing_marks quiz_date");

    if (!attempt) {
      return errorHandler(res, 404, "Attempt not found");
    }

    return successHandler(
      res,
      200,
      "Attempt retrieved successfully",
      attempt
    );
  } catch (error) {
    return errorHandler(res, 500, "Error retrieving attempt", error.message);
  }
};

// Get all attempts by student
const getMyAttempts = async (req, res) => {
  try {
    const student_id = req.user.userId;

    const attempts = await QuizAttempt.find({
      student_id,
      isActive: true,
    })
      .populate("quiz_id", "title subject total_marks passing_marks quiz_date class_name")
      .sort({ submitted_at: -1 });

    return successHandler(
      res,
      200,
      "Attempts retrieved successfully",
      attempts,
      attempts.length
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error retrieving attempts",
      error.message
    );
  }
};

// Get all attempts for a quiz (Admin)
const getQuizAttempts = async (req, res) => {
  try {
    const { quiz_id } = req.params;

    const attempts = await QuizAttempt.find({
      quiz_id,
      isActive: true,
    })
      .populate("student_id", "personal_info.first_name personal_info.last_name personal_info.email")
      .sort({ submitted_at: -1 });

    return successHandler(
      res,
      200,
      "Attempts retrieved successfully",
      attempts,
      attempts.length
    );
  } catch (error) {
    return errorHandler(
      res,
      500,
      "Error retrieving attempts",
      error.message
    );
  }
};

// Grade attempt (Admin) - For essay/short answer questions
const gradeAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, total_marks_obtained, feedback } = req.body;
    const graded_by = req.user.userId;

    const attempt = await QuizAttempt.findById(id).populate("quiz_id");
    if (!attempt) {
      return errorHandler(res, 404, "Attempt not found");
    }

    const percentage = (total_marks_obtained / attempt.quiz_id.total_marks) * 100;
    const passed = percentage >= attempt.quiz_id.passing_marks;

    attempt.answers = answers;
    attempt.total_marks_obtained = total_marks_obtained;
    attempt.percentage = percentage.toFixed(2);
    attempt.passed = passed;
    attempt.feedback = feedback;
    attempt.status = "graded";
    attempt.graded_by = graded_by;
    attempt.graded_at = new Date();

    await attempt.save();

    return successHandler(res, 200, "Attempt graded successfully", attempt);
  } catch (error) {
    return errorHandler(res, 500, "Error grading attempt", error.message);
  }
};

export default {
  startQuizAttempt,
  submitQuizAttempt,
  getMyAttempt,
  getMyAttempts,
  getQuizAttempts,
  gradeAttempt,
};
