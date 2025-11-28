import mongoose from "mongoose";

const testAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManualQuestion",
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
});

const testSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    config: {
      category: String,
      subjectArea: String,
      difficulty: String,
      examLevel: String,
      questionCount: {
        type: Number,
        default: 10,
      },
      timeLimit: {
        type: Number,
        default: 600,
      },
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ManualQuestion",
      },
    ],
    answers: [testAnswerSchema],
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
    },
    analytics: {
      averageTimePerQuestion: Number,
      strongAreas: [String],
      weakAreas: [String],
      strongTopics: [String],
      weakTopics: [String],
      recommendedTopics: [String],
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

testSchema.virtual("duration").get(function () {
  if (this.timing.completedAt) {
    return this.timing.completedAt - this.timing.startedAt;
  }
  return Date.now() - this.timing.startedAt;
});

testSchema.virtual("isExpired").get(function () {
  if (this.status === "completed") return false;
  const elapsed = Date.now() - this.timing.startedAt - this.timing.pausedDuration;
  return elapsed > this.config.timeLimit * 1000;
});

testSchema.methods.submitAnswer = function (questionId, userAnswer) {
  const existingAnswerIndex = this.answers.findIndex(
    (answer) => answer.questionId.toString() === questionId.toString()
  );

  if (existingAnswerIndex !== -1) {
    this.answers[existingAnswerIndex].userAnswer = userAnswer;
    this.answers[existingAnswerIndex].answeredAt = new Date();
  } else {
    this.answers.push({
      questionId,
      userAnswer,
      answeredAt: new Date(),
    });
  }

  return this.save();
};

testSchema.methods.calculateScore = async function () {
  await this.populate({
    path: "questions",
    populate: { path: "topicId", select: "name" }
  });

  let correct = 0;
  const total = this.questions.length;

  for (const answer of this.answers) {
    const question = this.questions.find(
      (q) => q._id.toString() === answer.questionId.toString()
    );

    if (question) {
      const correctOption = question.options.find((opt) => opt.isCorrect);
      if (correctOption && correctOption.text === answer.userAnswer) {
        answer.isCorrect = true;
        correct++;
      } else {
        answer.isCorrect = false;
      }
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

testSchema.methods.complete = async function () {
  this.status = "completed";
  this.timing.completedAt = new Date();
  this.timing.totalTimeSpent = this.timing.completedAt - this.timing.startedAt;

  await this.calculateScore();
  await this.generateAnalytics();

  // Update UserQuestionHistory
  const enhancedQuestionSelectionService = (await import("../services/enhancedQuestionSelectionService.js")).default;
  for (const answer of this.answers) {
    const question = this.questions.find(
      (q) => q._id.toString() === answer.questionId.toString()
    );
    if (question) {
      await enhancedQuestionSelectionService.processAnswerWithSM2(
        this.userId,
        answer.questionId,
        answer.isCorrect,
        answer.timeSpent || 0,
        question
      );
    }
  }

  return this.save();
};

testSchema.methods.generateAnalytics = function () {
  if (this.answers.length === 0) return;

  const totalTime = this.answers.reduce(
    (sum, answer) => sum + (answer.timeSpent || 0),
    0
  );
  this.analytics.averageTimePerQuestion = totalTime / this.answers.length;

  const categoryStats = {};
  const topicStats = {};

  this.questions.forEach((question) => {
    const answer = this.answers.find(
      (a) => a.questionId.toString() === question._id.toString()
    );

    // Category Stats
    if (!categoryStats[question.category]) {
      categoryStats[question.category] = { correct: 0, total: 0 };
    }
    categoryStats[question.category].total++;
    
    // Topic Stats
    const topicName = question.topicId?.name || "Unknown Topic";
    if (!topicStats[topicName]) {
      topicStats[topicName] = { correct: 0, total: 0 };
    }
    topicStats[topicName].total++;

    if (answer && answer.isCorrect) {
      categoryStats[question.category].correct++;
      topicStats[topicName].correct++;
    }
  });

  this.analytics.strongAreas = Object.entries(categoryStats)
    .filter(([, stats]) => stats.correct / stats.total >= 0.7)
    .map(([category]) => category);

  this.analytics.weakAreas = Object.entries(categoryStats)
    .filter(([, stats]) => stats.correct / stats.total < 0.6)
    .map(([category]) => category);

  this.analytics.strongTopics = Object.entries(topicStats)
    .filter(([, stats]) => stats.correct / stats.total >= 0.7)
    .map(([topic]) => topic);

  this.analytics.weakTopics = Object.entries(topicStats)
    .filter(([, stats]) => stats.correct / stats.total < 0.6)
    .map(([topic]) => topic);

  this.analytics.recommendedTopics = this.analytics.weakTopics.length > 0 
    ? this.analytics.weakTopics 
    : this.analytics.weakAreas;
};

testSchema.methods.pause = function () {
  if (this.status === "active") {
    this.status = "paused";
    return this.save();
  }
  throw new Error("Test is not active");
};

testSchema.methods.resume = function () {
  if (this.status === "paused") {
    this.status = "active";
    return this.save();
  }
  throw new Error("Test is not paused");
};

testSchema.statics.getTestHistory = function (userId, filters = {}) {
  const query = { userId, isActive: true };

  if (filters.status) query.status = filters.status;
  if (filters.category) query["config.category"] = filters.category;

  return this.find(query)
    .populate("userId", "firstName lastName")
    .sort({ createdAt: -1 });
};

testSchema.statics.getUserStats = function (userId) {
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
        totalTests: { $sum: 1 },
        averageScore: { $avg: "$score.percentage" },
        totalCorrect: { $sum: "$score.correct" },
        totalQuestions: { $sum: "$score.total" },
        bestScore: { $max: "$score.percentage" },
      },
    },
  ]);
};

testSchema.index({ userId: 1, status: 1 });
testSchema.index({ "timing.startedAt": -1 });
testSchema.index({ "score.percentage": -1 });

export default mongoose.model("Test", testSchema);
