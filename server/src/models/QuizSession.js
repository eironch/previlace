import mongoose from "mongoose";

const sessionAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManualQuestion",
    required: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
  },
  topicName: String,
  userAnswer: {
    type: String,
    default: "",
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
  feedbackShown: {
    type: Boolean,
    default: false,
  },
});

const quizSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["practice", "timed", "mock", "subject", "topic", "post-test", "assessment", "pretest", "daily-practice"],
      default: "practice",
    },
    weekNumber: {
      type: Number,
      default: null,
    },
    isWeek0Pretest: {
      type: Boolean,
      default: false,
    },
    hasImmediateFeedback: {
      type: Boolean,
      default: false,
    },
    hasTimer: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    config: {
      categories: [String],
      difficulty: String,
      examLevel: String,
      questionCount: {
        type: Number,
        default: 10,
      },
      timeLimit: {
        type: Number,
        default: 0,
      },
      defaultQuestionTime: {
        type: Number,
        default: 60,
      },
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ManualQuestion",
      },
    ],
    answers: [sessionAnswerSchema],
    status: {
      type: String,
      enum: ["active", "paused", "completed", "expired"],
      default: "active",
      index: true,
    },
    score: {
      total: {
        type: Number,
        default: 0,
      },
      correct: {
        type: Number,
        default: 0,
      },
      incorrect: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    timing: {
      startedAt: {
        type: Date,
        default: Date.now,
      },
      completedAt: Date,
      totalTimeSpent: {
        type: Number,
        default: 0,
      },
      pausedDuration: {
        type: Number,
        default: 0,
      },
      pausedAt: Date,
    },
    analytics: {
      averageTimePerQuestion: {
        type: Number,
        default: 0,
      },
      categoryPerformance: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      topicPerformance: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      strongAreas: {
        type: [String],
        default: [],
      },
      weakAreas: {
        type: [String],
        default: [],
      },
      weakTopics: {
        type: [String],
        default: [],
      },
      recommendedTopics: {
        type: [String],
        default: [],
      },
      difficultyAnalysis: {
        beginnerCorrect: { type: Number, default: 0 },
        beginnerTotal: { type: Number, default: 0 },
        intermediateCorrect: { type: Number, default: 0 },
        intermediateTotal: { type: Number, default: 0 },
        advancedCorrect: { type: Number, default: 0 },
        advancedTotal: { type: Number, default: 0 },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

quizSessionSchema.virtual("duration").get(function () {
  if (this.timing.completedAt) {
    return this.timing.completedAt - this.timing.startedAt;
  }
  return Date.now() - this.timing.startedAt;
});

quizSessionSchema.virtual("isExpired").get(function () {
  if (this.status === "completed") return false;
  const elapsed =
    Date.now() - this.timing.startedAt - this.timing.pausedDuration;
  return elapsed > this.config.timeLimit * 1000;
});

quizSessionSchema.methods.submitAnswer = async function (questionId, userAnswer, topicInfo = {}) {
  const existingAnswerIndex = this.answers.findIndex(
    (answer) => answer.questionId.toString() === questionId.toString()
  );

  const answerData = {
    questionId,
    userAnswer: userAnswer || "",
    isCorrect: false,
    answeredAt: new Date(),
    topicId: topicInfo.topicId,
    topicName: topicInfo.topicName,
  };

  if (existingAnswerIndex !== -1) {
    Object.assign(this.answers[existingAnswerIndex], answerData);
  } else {
    this.answers.push(answerData);
  }

  return this.save();
};

quizSessionSchema.methods.verifyAnswer = async function (questionId) {
  const question = this.questions.find(
    (q) => q._id.toString() === questionId.toString()
  );

  if (!question) return null;

  const answer = this.answers.find(
    (a) => a.questionId.toString() === questionId.toString()
  );

  if (!answer) return null;

  const correctOption = question.options?.find((opt) => opt.isCorrect);
  const userAnswerNormalized = (answer.userAnswer || "").toString().trim();
  const correctAnswerNormalized = correctOption
    ? correctOption.text.toString().trim()
    : "";

  const isCorrect =
    correctAnswerNormalized && correctAnswerNormalized === userAnswerNormalized;

  answer.isCorrect = isCorrect;
  answer.feedbackShown = true;

  await this.save();

  return {
    isCorrect,
    correctAnswer: correctAnswerNormalized,
    explanation: question.explanation,
    explanationMath: question.explanationMath,
  };
};

quizSessionSchema.methods.calculateScore = async function () {
  if (!this.questions || this.questions.length === 0) {
    await this.populate("questions");
  }

  let correct = 0;
  const total = this.questions.length;

  for (const answer of this.answers) {
    const question = this.questions.find(
      (q) => q._id.toString() === answer.questionId.toString()
    );

    if (question && question.options && Array.isArray(question.options)) {
      const correctOption = question.options.find((opt) => opt.isCorrect);
      const userAnswerNormalized = (answer.userAnswer || "").toString().trim();
      const correctAnswerNormalized = correctOption
        ? correctOption.text.toString().trim()
        : "";

      const isAnswerCorrect =
        correctAnswerNormalized &&
        correctAnswerNormalized === userAnswerNormalized;

      answer.isCorrect = isAnswerCorrect;
      if (isAnswerCorrect) {
        correct++;
      }
    } else {
      answer.isCorrect = false;
    }
  }

  this.score = {
    total,
    correct,
    incorrect: total - correct,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
  };

  return this.save();
};

quizSessionSchema.methods.complete = async function () {
  this.status = "completed";
  this.timing.completedAt = new Date();
  this.timing.totalTimeSpent =
    this.timing.completedAt -
    this.timing.startedAt -
    this.timing.pausedDuration;

  await this.calculateScore();
  await this.generateAnalytics();

  return this.save();
};

quizSessionSchema.methods.generateAnalytics = function () {
  if (!this.questions || this.questions.length === 0) {
    return;
  }

  const totalTime = this.answers.reduce(
    (sum, answer) => sum + (answer.timeSpent || 0),
    0
  );

  this.analytics.averageTimePerQuestion =
    this.answers.length > 0 ? totalTime / this.answers.length : 0;

  const categoryStats = {};
  const topicStats = {};
  const difficultyStats = {
    beginnerCorrect: 0,
    beginnerTotal: 0,
    intermediateCorrect: 0,
    intermediateTotal: 0,
    advancedCorrect: 0,
    advancedTotal: 0,
  };

  this.questions.forEach((question) => {
    const answer = this.answers.find(
      (a) => a.questionId.toString() === question._id.toString()
    );

    const category = question.category || "Uncategorized";
    const difficultyNormalized =
      (question.difficulty || "intermediate").toLowerCase();

    if (!categoryStats[category]) {
      categoryStats[category] = { correct: 0, total: 0, percentage: 0 };
    }

    categoryStats[category].total++;

    if (answer?.topicName) {
      if (!topicStats[answer.topicName]) {
        topicStats[answer.topicName] = { correct: 0, total: 0, percentage: 0 };
      }
      topicStats[answer.topicName].total++;
    }

    if (difficultyNormalized === "beginner") {
      difficultyStats.beginnerTotal++;
    } else if (difficultyNormalized === "intermediate") {
      difficultyStats.intermediateTotal++;
    } else if (difficultyNormalized === "advanced") {
      difficultyStats.advancedTotal++;
    }

    if (answer && answer.isCorrect) {
      categoryStats[category].correct++;

      if (answer.topicName && topicStats[answer.topicName]) {
        topicStats[answer.topicName].correct++;
      }

      if (difficultyNormalized === "beginner") {
        difficultyStats.beginnerCorrect++;
      } else if (difficultyNormalized === "intermediate") {
        difficultyStats.intermediateCorrect++;
      } else if (difficultyNormalized === "advanced") {
        difficultyStats.advancedCorrect++;
      }
    }
  });

  const categoryPerformance = {};
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const percentage =
      stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    categoryPerformance[category] = {
      correct: stats.correct,
      total: stats.total,
      percentage,
    };
  });

  const topicPerformance = {};
  Object.entries(topicStats).forEach(([topic, stats]) => {
    const percentage =
      stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    topicPerformance[topic] = {
      correct: stats.correct,
      total: stats.total,
      percentage,
    };
  });

  this.analytics = {
    ...this.analytics,
    categoryPerformance: JSON.parse(JSON.stringify(categoryPerformance)),
    topicPerformance: JSON.parse(JSON.stringify(topicPerformance)),
  };

  this.analytics.strongAreas = Object.entries(categoryStats)
    .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total >= 0.7)
    .map(([category]) => category);

  this.analytics.weakAreas = Object.entries(categoryStats)
    .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total < 0.5)
    .map(([category]) => category);

  this.analytics.weakTopics = Object.entries(topicStats)
    .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total < 0.5)
    .map(([topic]) => topic);

  this.analytics.recommendedTopics = this.analytics.weakTopics;
  this.analytics.difficultyAnalysis = difficultyStats;
}

quizSessionSchema.methods.pause = function () {
  if (this.status === "active") {
    this.status = "paused";
    this.timing.pausedAt = new Date();
    return this.save();
  }
  throw new Error("Session is not active");
};

quizSessionSchema.methods.resume = function () {
  if (this.status === "paused") {
    this.status = "active";
    if (this.timing.pausedAt) {
      this.timing.pausedDuration +=
        Date.now() - this.timing.pausedAt.getTime();
      this.timing.pausedAt = null;
    }
    return this.save();
  }
  throw new Error("Session is not paused");
};

quizSessionSchema.statics.getSessionHistory = function (userId, filters = {}) {
  const query = { userId, isActive: true };

  if (filters.status) query.status = filters.status;
  if (filters.mode) query.mode = filters.mode;
  if (filters.examLevel) query["config.examLevel"] = filters.examLevel;

  return this.find(query)
    .populate("userId", "firstName lastName")
    .sort({ createdAt: -1 });
};

quizSessionSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        averageScore: { $avg: "$score.percentage" },
        totalCorrect: { $sum: "$score.correct" },
        totalQuestions: { $sum: "$score.total" },
        bestScore: { $max: "$score.percentage" },
        totalTimeSpent: { $sum: "$timing.totalTimeSpent" },
      },
    },
  ]);
};

quizSessionSchema.index({ userId: 1, status: 1 });
quizSessionSchema.index({ "timing.startedAt": -1 });
quizSessionSchema.index({ "score.percentage": -1 });
quizSessionSchema.index({ mode: 1, status: 1 });

export default mongoose.model("QuizSession", quizSessionSchema);
