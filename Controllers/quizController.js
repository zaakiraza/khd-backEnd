import Quiz from "../Models/quiz.js";
import Class from "../Models/class.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

// Create Quiz
const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      class_id,
      subject,
      quiz_date,
      start_time,
      duration,
      passing_marks,
      questions,
      end_time,
    } = req.body;

    // Validate class exists
    const classExists = await Class.findById(class_id);
    if (!classExists) {
      return errorHandler(res, 404, "Class not found");
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      return errorHandler(res, 400, "At least one question is required");
    }

    const quiz = new Quiz({
      title,
      description,
      class_id,
      class_name: classExists.class_name,
      subject,
      quiz_date,
      start_time,
      end_time,
      duration,
      passing_marks,
      questions,
      created_by: req.user.id,
    });

    await quiz.save();
    successHandler(res, 201, "Quiz created successfully", quiz);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get All Quizzes with filters
const getAllQuizzes = async (req, res) => {
  try {
    const { class_id, status, isActive } = req.query;
    const filter = {};

    if (class_id) filter.class_id = class_id;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const quizzes = await Quiz.find(filter)
      .populate("class_id", "class_name teacher_assigned")
      .populate("created_by", "name email")
      .sort({ quiz_date: -1 });

    // Auto-close expired quizzes
    const now = new Date();
    for (let quiz of quizzes) {
      if (quiz.status === 'published') {
        const quizDate = new Date(quiz.quiz_date);
        const [hours, minutes] = quiz.end_time.split(':');
        quizDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (now > quizDate) {
          quiz.status = 'close';
          await quiz.save();
        }
      }
    }

    successHandler(res, 200, "Quizzes fetched successfully", quizzes);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Quiz by ID
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate("class_id", "class_name teacher_assigned")
      .populate("created_by", "name email");

    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    successHandler(res, 200, "Quiz fetched successfully", quiz);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Update Quiz
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      class_id,
      subject,
      quiz_date,
      start_time,
      end_time,
      duration,
      passing_marks,
      questions,
    } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    // If class_id is being updated, validate it
    if (class_id && class_id !== quiz.class_id.toString()) {
      const classExists = await Class.findById(class_id);
      if (!classExists) {
        return errorHandler(res, 404, "Class not found");
      }
      quiz.class_name = classExists.class_name;
    }

    // Update fields
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (class_id) quiz.class_id = class_id;
    if (subject) quiz.subject = subject;
    if (quiz_date) quiz.quiz_date = quiz_date;
    if (start_time) quiz.start_time = start_time;
    if (end_time) quiz.end_time = end_time;
    if (duration) quiz.duration = duration;
    if (passing_marks !== undefined) quiz.passing_marks = passing_marks;
    if (questions) quiz.questions = questions;

    await quiz.save();
    successHandler(res, 200, "Quiz updated successfully", quiz);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Delete Quiz
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    successHandler(res, 200, "Quiz deleted successfully", null);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Update Quiz Status
const updateQuizStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "close"].includes(status)) {
      return errorHandler(res, 400, "Invalid status");
    }

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    successHandler(res, 200, "Quiz status updated successfully", quiz);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Toggle Active Status
const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    successHandler(
      res,
      200,
      `Quiz ${quiz.isActive ? "activated" : "deactivated"} successfully`,
      quiz
    );
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Quizzes by Class
const getQuizzesByClass = async (req, res) => {
  try {
    const { class_id } = req.params;

    const quizzes = await Quiz.find({
      class_id,
      isActive: true,
    })
      .populate("created_by", "name email")
      .sort({ quiz_date: -1 });

    successHandler(res, 200, "Class quizzes fetched successfully", quizzes);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Upcoming Quizzes (next 7 days)
const getUpcomingQuizzes = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const quizzes = await Quiz.find({
      quiz_date: { $gte: today, $lte: nextWeek },
      status: "published",
      isActive: true,
    })
      .populate("class_id", "class_name")
      .sort({ quiz_date: 1 });

    successHandler(res, 200, "Upcoming quizzes fetched successfully", quizzes);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

export default {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  updateQuizStatus,
  toggleActiveStatus,
  getQuizzesByClass,
  getUpcomingQuizzes,
};
