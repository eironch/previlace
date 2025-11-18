import QuizSession from "../models/QuizSession.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import ManualQuestion from "../models/ManualQuestion.js";
import { AppError, catchAsync } from "../utils/AppError.js";
import questionSelectionService from "../services/questionSelectionService.js";
import spacedRepetitionService from "../services/spacedRepetitionService.js";
import performanceAnalysisService from "../services/performanceAnalysisService.js";
import studyPlanService from "../services/studyPlanService.js";
import adaptiveQuizService from "../services/adaptiveQuizService.js";
import pdfGenerationService from "../services/pdfGenerationService.js";

const startQuizSession = catchAsync(async (req, res, next) => {
  const {
    mode = "practice",
    title,
    categories,
    difficulty,
    examLevel,
    questionCount = 10,
    timeLimit,
  } = req.body;

  if (!["practice", "timed"].includes(mode)) {
    return next(new AppError("Invalid quiz mode", 400));
  }

  const userExamLevel = examLevel || req.user.examType || "Professional";

  const hasImmediateFeedback = ["practice"].includes(mode);
  const hasTimer = ["timed", "mock"].includes(mode);
  const calculatedTimeLimit = hasTimer
    ? timeLimit || (mode === "mock" ? 10800 : questionCount * 90)
    : 0;

  const config = {
    categories: categories || [],
    difficulty: difficulty || "",
    examLevel: userExamLevel,
    questionCount,
    timeLimit: calculatedTimeLimit,
    defaultQuestionTime: 90,
  };

  const questions = await questionSelectionService.selectQuestionsForSession(req.user._id, config);

  if (questions.length === 0) {
    return next(new AppError("No questions found matching criteria", 404));
  }

  const populatedQuestions = await ManualQuestion.find({
    _id: { $in: questions.map(q => q._id) }
  }).populate("topicId", "name");

  const session = await QuizSession.create({
    userId: req.user._id,
    mode,
    title: title || `${mode.charAt(0).toUpperCase() + mode.slice(1)} Quiz`,
    hasImmediateFeedback,
    hasTimer,
    config: {
      ...config,
      questionCount: questions.length,
    },
    questions: questions.map((q) => q._id),
    });

    res.status(201).json({
    success: true,
    data: {
    session: {
    _id: session._id,
    title: session.title,
    mode: session.mode,
    timeLimit: session.config.timeLimit,
    questionCount: session.questions.length,
    hasImmediateFeedback,
    hasTimer,
    },
    questions: populatedQuestions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionMath: q.questionMath,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        subjectArea: q.subjectArea,
        topicId: q.topicId?._id,
        topicName: q.topicId?.name,
      })),
    },
  });
});

const submitAnswer = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const { questionId, answer, timeSpent, topicId, topicName } = req.body;

  const session = await QuizSession.findById(sessionId).populate("questions");

  if (!session) {
    return next(new AppError("Quiz session not found", 404));
  }

  if (session.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to access this session", 403));
  }

  if (session.status !== "active" && session.status !== "paused") {
    return next(new AppError("Quiz session is not active", 400));
  }

  await session.submitAnswer(questionId, answer, { topicId, topicName });

  if (timeSpent && timeSpent > 0) {
    const answerRecord = session.answers.find(
      (a) => a.questionId.toString() === questionId.toString()
    );
    if (answerRecord) {
      answerRecord.timeSpent = timeSpent;
      await session.save();
    }
  }

  let feedback = null;
  if (session.hasImmediateFeedback) {
    feedback = await session.verifyAnswer(questionId);
  }

  res.json({
    success: true,
    data: {
      message: "Answer submitted successfully",
      feedback,
    },
  });
});

const completeQuizSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await QuizSession.findById(sessionId).populate("questions");

  if (!session) {
    return next(new AppError("Quiz session not found", 404));
  }

  if (session.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to access this session", 403));
  }

  if (session.status === "completed") {
    return next(new AppError("Quiz session already completed", 400));
  }

  await session.complete();

  for (const answer of session.answers) {
    const question = session.questions.find((q) => q._id.toString() === answer.questionId.toString());
    
    await spacedRepetitionService.updateQuestionHistory(req.user._id, answer.questionId, {
      sessionId: session._id,
      isCorrect: answer.isCorrect,
      timeSpent: answer.timeSpent || 0,
      userAnswer: answer.userAnswer,
      responseTime: answer.timeSpent || 0,
      difficulty: question?.difficulty || "intermediate",
      repetitions: 0
    });
  }

  const result = {
    sessionId: session._id,
    title: session.title,
    mode: session.mode,
    score: session.score,
    timing: session.timing,
    analytics: session.analytics,
    answers: session.answers.map((answer) => {
      const question = session.questions.find((q) => q._id.toString() === answer.questionId.toString());

      return {
        questionId: answer.questionId,
        question: question
          ? {
              questionText: question.questionText,
              questionMath: question.questionMath,
              options: question.options,
              explanation: question.explanation,
              explanationMath: question.explanationMath,
              category: question.category,
              difficulty: question.difficulty,
            }
          : null,
        userAnswer: answer.userAnswer,
        correctAnswer: question
          ? question.options.find((opt) => opt.isCorrect)?.text
          : null,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
      };
    }),
  };

  res.json({
    success: true,
    data: { result },
  });
});

const getQuizResult = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await QuizSession.findById(sessionId).populate("questions");

  if (!session) {
    return next(new AppError("Quiz session not found", 404));
  }

  if (session.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("Not authorized to view this session", 403));
  }

  const result = {
    sessionId: session._id,
    title: session.title,
    mode: session.mode,
    status: session.status,
    score: session.score,
    timing: session.timing,
    analytics: session.analytics,
    answers: session.answers.map((answer) => {
      const question = session.questions.find((q) => q._id.toString() === answer.questionId.toString());

      return {
        questionId: answer.questionId,
        question: question
          ? {
              questionText: question.questionText,
              questionMath: question.questionMath,
              options: question.options,
              explanation: question.explanation,
              explanationMath: question.explanationMath,
              category: question.category,
              difficulty: question.difficulty,
            }
          : null,
        userAnswer: answer.userAnswer,
        correctAnswer: question
          ? question.options.find((opt) => opt.isCorrect)?.text
          : null,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
      };
    }),
  };

  res.json({
    success: true,
    data: { result },
  });
});

const getSessionHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, mode, status, examLevel } = req.query;

  const filters = {};
  if (mode) filters.mode = mode;
  if (status) filters.status = status;
  if (examLevel) filters["config.examLevel"] = examLevel;

  const sessions = await QuizSession.getSessionHistory(req.user._id, filters);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedSessions = sessions.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    data: {
      sessions: paginatedSessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(sessions.length / parseInt(limit)),
        totalItems: sessions.length,
        hasNextPage: page * limit < sessions.length,
        hasPrevPage: page > 1,
      },
    },
  });
});

const pauseQuizSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await QuizSession.findById(sessionId);

  if (!session) {
    return next(new AppError("Quiz session not found", 404));
  }

  if (session.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to pause this session", 403));
  }

  try {
    await session.pause();

    res.json({
      success: true,
      data: { message: "Quiz paused successfully" },
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

const resumeQuizSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await QuizSession.findById(sessionId);

  if (!session) {
    return next(new AppError("Quiz session not found", 404));
  }

  if (session.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to resume this session", 403));
  }

  try {
    await session.resume();

    res.json({
      success: true,
      data: { message: "Quiz resumed successfully" },
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

const getUserStats = catchAsync(async (req, res, next) => {
  const stats = await QuizSession.getUserStats(req.user._id);

  res.json({
    success: true,
    data: { stats: stats[0] || null },
  });
});

const startMockExam = catchAsync(async (req, res, next) => {
  const { examLevel = "Professional" } = req.body;

  const targetQuestionCount = examLevel === "Professional" ? 170 : 165;
  const timeLimit = examLevel === "Professional" ? 10800 : 9000;

  const availableQuestions = await ManualQuestion.countDocuments({
    $or: [{ examLevel: examLevel }, { examLevel: "Both" }],
    status: "published",
    isActive: true,
  });

  if (availableQuestions < 50) {
    return next(
      new AppError(
        "Not enough questions available to start mock exam. Please contact administrator.",
        400
      )
    );
  }

  const mockExamConfig = {
    categories: [],
    difficulty: "",
    examLevel,
    questionCount: Math.min(availableQuestions, targetQuestionCount),
    timeLimit,
    defaultQuestionTime: 60,
  };

  const questions = await questionSelectionService.selectQuestionsForSession(
    req.user._id,
    mockExamConfig
  );

  if (questions.length === 0) {
    return next(
      new AppError("Unable to generate mock exam questions. Please try again later.", 500)
    );
  }

  const populatedQuestions = await ManualQuestion.find({
    _id: { $in: questions.map(q => q._id) }
  }).populate("topicId", "name");

  const session = await QuizSession.create({
    userId: req.user._id,
    mode: "mock",
    title: `${examLevel} Mock Exam`,
    hasImmediateFeedback: false,
    hasTimer: true,
    config: mockExamConfig,
    questions: questions.map((q) => q._id),
    });

    res.status(201).json({
    success: true,
    data: {
    session: {
    _id: session._id,
    title: session.title,
    mode: session.mode,
    timeLimit: session.config.timeLimit,
    questionCount: session.questions.length,
    hasImmediateFeedback: false,
    hasTimer: true,
    },
    questions: populatedQuestions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionMath: q.questionMath,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        subjectArea: q.subjectArea,
        topicId: q.topicId?._id,
        topicName: q.topicId?.name,
      })),
    },
  });
});

const getPerformanceAnalytics = catchAsync(async (req, res, next) => {
  const analytics = await performanceAnalysisService.calculateUserStatistics(
    req.user._id
  );

  res.json({
    success: true,
    data: { analytics },
  });
});

const getExamReadiness = catchAsync(async (req, res, next) => {
  const { examLevel = "professional" } = req.query;
  
  const readiness = await performanceAnalysisService.getExamReadinessScore(
    req.user._id,
    examLevel
  );

  res.json({
    success: true,
    data: { readiness },
  });
});

const generateStudyPlan = catchAsync(async (req, res, next) => {
  const { targetDate } = req.body;

  if (!targetDate) {
    return next(new AppError("Target exam date is required", 400));
  }

  const studyPlan = await studyPlanService.generatePersonalizedPlan(
    req.user._id,
    targetDate
  );

  res.status(201).json({
    success: true,
    data: { studyPlan },
  });
});

const trackStudySession = catchAsync(async (req, res, next) => {
  const sessionData = req.body;
  
  const adherenceUpdate = await studyPlanService.trackStudySession(
    req.user._id,
    sessionData
  );

  res.json({
    success: true,
    data: { adherenceUpdate },
  });
});

const getSpacedRepetitionQuestions = catchAsync(async (req, res, next) => {
  const { limit = 20 } = req.query;
  
  const dueQuestions = await spacedRepetitionService.getDueQuestions(
    req.user._id,
    parseInt(limit)
  );

  const questionIds = dueQuestions.map((q) => q.questionId);
  const questions = await ManualQuestion.find({
    _id: { $in: questionIds },
  });

  res.json({
    success: true,
    data: {
      questions: questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionMath: q.questionMath,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        subjectArea: q.subjectArea,
      })),
      dueCount: dueQuestions.length,
    },
  });
});

const getReviewSchedule = catchAsync(async (req, res, next) => {
  const { days = 7 } = req.query;
  
  const schedule = await spacedRepetitionService.getReviewSchedule(
    req.user._id,
    parseInt(days)
  );

  res.json({
    success: true,
    data: { schedule },
  });
});

const exportQuizResultPdf = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await QuizSession.findById(sessionId).populate("questions");

  if (!session) {
    return next(new AppError("Quiz session not found", 404));
  }

  if (session.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("Not authorized to export this session", 403));
  }

  const result = {
    sessionId: session._id,
    title: session.title,
    mode: session.mode,
    score: session.score,
    timing: session.timing,
    analytics: session.analytics,
    answers: session.answers.map((answer) => {
      const question = session.questions.find((q) => q._id.toString() === answer.questionId.toString());

      return {
        questionId: answer.questionId,
        question: question
          ? {
              questionText: question.questionText,
              questionMath: question.questionMath,
              options: question.options,
              explanation: question.explanation,
              explanationMath: question.explanationMath,
              category: question.category,
              difficulty: question.difficulty,
            }
          : null,
        userAnswer: answer.userAnswer,
        correctAnswer: question
          ? question.options.find((opt) => opt.isCorrect)?.text
          : null,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
      };
    }),
  };

  const pdfBuffer = await pdfGenerationService.generateQuizResultPdf(result);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=quiz-results-${sessionId}.pdf`
  );
  res.send(pdfBuffer);
});

const startSubjectQuiz = catchAsync(async (req, res, next) => {
  const { subjectId, examLevel, questionCount = 25 } = req.body;

  if (!subjectId) {
    return next(new AppError("Subject ID is required", 400));
  }

  const userExamLevel = examLevel || req.user.examType || "Professional";

  const quizData = await adaptiveQuizService.createSubjectQuiz(
    req.user._id,
    subjectId,
    userExamLevel,
    questionCount
  );

  const populatedQuestions = await ManualQuestion.find({
    _id: { $in: quizData.questions.map(q => q._id) }
  }).populate("topicId", "name");

  const session = await QuizSession.create({
    userId: req.user._id,
    mode: "subject",
    title: "Subject Quiz",
    hasImmediateFeedback: true,
    hasTimer: false,
    config: {
      subjectId,
      examLevel: userExamLevel,
      questionCount: quizData.questions.length,
      difficulty: quizData.difficulty,
      isAdaptive: true,
      timeLimit: 0,
      defaultQuestionTime: 90,
    },
    questions: quizData.questions.map((q) => q._id),
    });

    res.status(201).json({
    success: true,
    data: {
    session: {
    _id: session._id,
    title: session.title,
    mode: session.mode,
    timeLimit: 0,
    questionCount: session.questions.length,
    difficulty: quizData.difficulty,
    weakTopics: quizData.weakTopics,
    hasImmediateFeedback: true,
    hasTimer: false,
    },
    questions: populatedQuestions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionMath: q.questionMath,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        subjectArea: q.subjectArea,
        topicId: q.topicId?._id,
        topicName: q.topicId?.name,
      })),
    },
  });
});

const startTopicQuiz = catchAsync(async (req, res, next) => {
  const { topicId, examLevel, questionCount = 15 } = req.body;

  if (!topicId) {
    return next(new AppError("Topic ID is required", 400));
  }

  const userExamLevel = examLevel || req.user.examType || "Professional";

  const quizData = await adaptiveQuizService.createTopicQuiz(
    req.user._id,
    topicId,
    userExamLevel,
    questionCount
  );

  const populatedQuestions = await ManualQuestion.find({
    _id: { $in: quizData.questions.map(q => q._id) }
  }).populate("topicId", "name");

  const session = await QuizSession.create({
    userId: req.user._id,
    mode: "topic",
    title: "Topic Quiz",
    hasImmediateFeedback: true,
    hasTimer: false,
    config: {
      topicId,
      examLevel: userExamLevel,
      questionCount: quizData.questions.length,
      difficulty: quizData.difficulty,
      isAdaptive: true,
      timeLimit: 0,
      defaultQuestionTime: 90,
    },
    questions: quizData.questions.map((q) => q._id),
    });

    res.status(201).json({
    success: true,
    data: {
    session: {
    _id: session._id,
    title: session.title,
    mode: session.mode,
    timeLimit: 0,
    questionCount: session.questions.length,
    difficulty: quizData.difficulty,
    hasImmediateFeedback: true,
    hasTimer: false,
    },
    questions: populatedQuestions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionMath: q.questionMath,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        subjectArea: q.subjectArea,
        topicId: q.topicId?._id,
        topicName: q.topicId?.name,
      })),
    },
  });
});

export default {
  startQuizSession,
  submitAnswer,
  completeQuizSession,
  getQuizResult,
  getSessionHistory,
  pauseQuizSession,
  resumeQuizSession,
  getUserStats,
  startMockExam,
  startSubjectQuiz,
  startTopicQuiz,
  getPerformanceAnalytics,
  getExamReadiness,
  generateStudyPlan,
  trackStudySession,
  getSpacedRepetitionQuestions,
  getReviewSchedule,
  exportQuizResultPdf,
};
