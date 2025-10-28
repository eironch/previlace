import Test from "../models/Test.js";
import ManualQuestion from "../models/ManualQuestion.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/AppError.js";

const startTest = catchAsync(async (req, res, next) => {
  const { title, category, subjectArea, difficulty, examLevel, questionCount = 10, timeLimit = 600 } = req.body;
  
  const filters = { workflowState: "published", isActive: true };
  if (category) filters.category = category;
  if (subjectArea) filters.subjectArea = subjectArea;
  if (difficulty) filters.difficulty = difficulty;
  if (examLevel) {
    filters.$or = [{ examLevel }, { examLevel: "Both" }];
  }
  
  const questions = await ManualQuestion.getRandomQuestions(filters, questionCount);
  
  if (questions.length === 0) {
    return next(new AppError("No questions found matching criteria", 404));
  }
  
  const test = await Test.create({
    userId: req.user._id,
    title: title || `${examLevel} Level Test`,
    config: {
      category,
      subjectArea,
      difficulty,
      examLevel,
      questionCount: questions.length,
      timeLimit,
    },
    questions: questions.map((q) => q._id),
  });
  
  await test.populate("questions");
  
  res.status(201).json({
    success: true,
    data: {
      test: {
        _id: test._id,
        title: test.title,
        timeLimit: test.config.timeLimit,
        questionCount: test.questions.length,
      },
      questions: test.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionMath: q.questionMath,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        passageText: q.passageText,
        passageTitle: q.passageTitle,
      })),
    },
  });
});

const submitTest = catchAsync(async (req, res, next) => {
  const { answers } = req.body;
  const testId = req.params.id;
  
  const test = await Test.findById(testId).populate("questions");
  
  if (!test) {
    return next(new AppError("Test not found", 404));
  }
  
  if (test.userId.toString() !== req.user._id) {
    return next(new AppError("Not authorized to submit this test", 403));
  }
  
  if (test.status === "completed") {
    return next(new AppError("Test already completed", 400));
  }
  
  for (const [questionId, answerData] of Object.entries(answers)) {
    await test.submitAnswer(questionId, answerData.answer);
  }
  
  await test.complete();
  
  const result = {
    testId: test._id,
    score: test.score,
    timing: test.timing,
    analytics: test.analytics,
    answers: test.answers.map((answer) => {
      const question = test.questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return {
        questionId: answer.questionId,
        question: question
          ? {
              questionText: question.questionText,
              questionMath: question.questionMath,
              options: question.options,
              explanation: question.explanation,
              explanationMath: question.explanationMath,
            }
          : null,
        userAnswer: answer.userAnswer,
        correctAnswer: question
          ? question.options.find((opt) => opt.isCorrect)?.text
          : null,
        isCorrect: answer.isCorrect,
      };
    }),
  };
  
  res.json({
    success: true,
    data: { result },
  });
});

const getTestResult = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.params.id).populate("questions");
  
  if (!test) {
    return next(new AppError("Test not found", 404));
  }
  
  if (test.userId.toString() !== req.user._id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to view this test", 403));
  }
  
  const result = {
    testId: test._id,
    title: test.title,
    status: test.status,
    score: test.score,
    timing: test.timing,
    analytics: test.analytics,
    answers: test.answers.map((answer) => {
      const question = test.questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return {
        questionId: answer.questionId,
        question: question
          ? {
              questionText: question.questionText,
              questionMath: question.questionMath,
              options: question.options,
              explanation: question.explanation,
              explanationMath: question.explanationMath,
            }
          : null,
        userAnswer: answer.userAnswer,
        correctAnswer: question
          ? question.options.find((opt) => opt.isCorrect)?.text
          : null,
        isCorrect: answer.isCorrect,
      };
    }),
  };
  
  res.json({
    success: true,
    data: { result },
  });
});

const getTestHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, category } = req.query;
  
  const filters = { status, category };
  const tests = await Test.getTestHistory(req.user._id, filters);
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedTests = tests.slice(skip, skip + parseInt(limit));
  
  res.json({
    success: true,
    data: {
      tests: paginatedTests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(tests.length / parseInt(limit)),
        totalItems: tests.length,
        hasNextPage: page * limit < tests.length,
        hasPrevPage: page > 1,
      },
    },
  });
});

const pauseTest = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.params.id);
  
  if (!test) {
    return next(new AppError("Test not found", 404));
  }
  
  if (test.userId.toString() !== req.user._id) {
    return next(new AppError("Not authorized to pause this test", 403));
  }
  
  await test.pause();
  
  res.json({
    success: true,
    message: "Test paused successfully",
  });
});

const resumeTest = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.params.id);
  
  if (!test) {
    return next(new AppError("Test not found", 404));
  }
  
  if (test.userId.toString() !== req.user._id) {
    return next(new AppError("Not authorized to resume this test", 403));
  }
  
  await test.resume();
  
  res.json({
    success: true,
    message: "Test resumed successfully",
  });
});

const getUserStats = catchAsync(async (req, res, next) => {
  const stats = await Test.getUserStats(req.user._id);
  
  res.json({
    success: true,
    data: { stats: stats[0] || null },
  });
});

export default {
  startTest,
  submitTest,
  getTestResult,
  getTestHistory,
  pauseTest,
  resumeTest,
  getUserStats,
};