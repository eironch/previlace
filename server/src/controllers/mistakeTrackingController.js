import UserQuestionHistory from "../models/UserQuestionHistory.js";
import QuizSession from "../models/QuizSession.js";
import mistakeAnalysisService from "../services/mistakeAnalysisService.js";
import { AppError, catchAsync } from "../utils/AppError.js";

const getMistakeAnalysis = catchAsync(async (req, res, next) => {
  const { days = 30 } = req.query;

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

  const userHistories = await UserQuestionHistory.find({
    userId: req.user._id,
    "attempts.answeredAt": { $gte: dateThreshold },
  }).populate("questionId");

  const answerHistory = [];
  userHistories.forEach((history) => {
    history.attempts.forEach((attempt) => {
      if (new Date(attempt.answeredAt) >= dateThreshold) {
        answerHistory.push({
          questionId: history.questionId._id,
          isCorrect: attempt.isCorrect,
          userAnswer: attempt.userAnswer,
          answeredAt: attempt.answeredAt,
        });
      }
    });
  });

  const questions = userHistories.map((h) => h.questionId);

  const analysis = mistakeAnalysisService.analyzePatterns(answerHistory, questions);

  res.json({
    success: true,
    data: { analysis },
  });
});

const getRemediationPlan = catchAsync(async (req, res, next) => {
  const userHistories = await UserQuestionHistory.find({
    userId: req.user._id,
  }).populate("questionId");

  const answerHistory = [];
  userHistories.forEach((history) => {
    history.attempts.forEach((attempt) => {
      answerHistory.push({
        questionId: history.questionId._id,
        isCorrect: attempt.isCorrect,
      });
    });
  });

  const questions = userHistories.map((h) => h.questionId);
  const analysis = mistakeAnalysisService.analyzePatterns(answerHistory, questions);
  const plan = mistakeAnalysisService.generateRemediationPlan(
    analysis,
    userHistories
  );

  res.json({
    success: true,
    data: { remediationPlan: plan },
  });
});

const getMistakeFrequency = catchAsync(async (req, res, next) => {
  const userHistories = await UserQuestionHistory.find({
    userId: req.user._id,
  });

  const frequency = mistakeAnalysisService.calculateMistakeFrequency(userHistories);

  res.json({
    success: true,
    data: { frequency },
  });
});

const getSystematicErrors = catchAsync(async (req, res, next) => {
  const userHistories = await UserQuestionHistory.find({
    userId: req.user._id,
  }).populate("questionId");

  const answerHistory = [];
  userHistories.forEach((history) => {
    history.attempts.forEach((attempt) => {
      answerHistory.push({
        questionId: history.questionId._id,
        isCorrect: attempt.isCorrect,
        userAnswer: attempt.userAnswer,
      });
    });
  });

  const questions = userHistories.map((h) => h.questionId);
  const patterns = mistakeAnalysisService.identifySystematicErrors(
    answerHistory,
    questions
  );

  res.json({
    success: true,
    data: { patterns },
  });
});

const createMistakeQuiz = catchAsync(async (req, res, next) => {
  const { category, limit = 10 } = req.body;

  if (!category) {
    return next(new AppError("Category is required", 400));
  }

  const userHistories = await UserQuestionHistory.find({
    userId: req.user._id,
  }).populate("questionId");

  const mistakeQuestions = userHistories
    .filter(
      (h) =>
        h.questionId.category === category &&
        h.correctAttempts / h.totalAttempts < 0.5
    )
    .sort((a, b) => a.correctAttempts - b.correctAttempts)
    .slice(0, limit)
    .map((h) => h.questionId._id);

  if (mistakeQuestions.length === 0) {
    return next(
      new AppError("No mistakes found for this category", 404)
    );
  }

  const session = await QuizSession.create({
    userId: req.user._id,
    mode: "practice",
    title: `Mistake Review: ${category}`,
    config: {
      categories: [category],
      examLevel: "",
      questionCount: mistakeQuestions.length,
      timeLimit: 1200,
    },
    questions: mistakeQuestions,
  });

  res.status(201).json({
    success: true,
    data: { sessionId: session._id },
  });
});

export default {
  getMistakeAnalysis,
  getRemediationPlan,
  getMistakeFrequency,
  getSystematicErrors,
  createMistakeQuiz,
};
