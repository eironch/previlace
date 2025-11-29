import mongoose from "mongoose";

const integrityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "tab_switch",
      "focus_lost",
      "copy_attempt",
      "paste_attempt",
      "right_click",
      "text_select",
      "fullscreen_exit",
      "mouse_leave",
      "keyboard_shortcut",
    ],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  duration: Number,
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManualQuestion",
  },
  metadata: mongoose.Schema.Types.Mixed,
});

const questionTimingSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManualQuestion",
    required: true,
  },
  totalTime: {
    type: Number,
    default: 0,
  },
  firstViewedAt: Date,
  answeredAt: Date,
  revisitCount: {
    type: Number,
    default: 0,
  },
});

const answerChangeSchema = new mongoose.Schema({
  from: String,
  to: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const answerBehaviorSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManualQuestion",
    required: true,
  },
  changeHistory: [answerChangeSchema],
  totalChanges: {
    type: Number,
    default: 0,
  },
  firstAnswer: String,
  finalAnswer: String,
  wasSkipped: {
    type: Boolean,
    default: false,
  },
  wasRevisited: {
    type: Boolean,
    default: false,
  },
});

const quizSessionBehaviorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: true,
      unique: true,
      index: true,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    activeTime: {
      type: Number,
      default: 0,
    },
    idleTime: {
      type: Number,
      default: 0,
    },
    questionTimings: [questionTimingSchema],
    integrityEvents: [integrityEventSchema],
    answerBehavior: [answerBehaviorSchema],
    integrityScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    engagementScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    focusScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    confidenceScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    flaggedForReview: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReasons: [String],
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNotes: String,
    posthogSessionId: String,
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

quizSessionBehaviorSchema.methods.calculateIntegrityScore = function () {
  let score = 100;
  const weights = {
    tab_switch: 3,
    focus_lost: 2,
    copy_attempt: 10,
    paste_attempt: 15,
    right_click: 2,
    text_select: 1,
    fullscreen_exit: 3,
    mouse_leave: 0.5,
    keyboard_shortcut: 5,
  };

  for (const event of this.integrityEvents) {
    let penalty = weights[event.type] || 1;
    if ((event.type === "tab_switch" || event.type === "focus_lost") && event.duration > 5000) {
      penalty *= 1.5;
    }
    score -= penalty;
  }

  const avgChanges = this.answerBehavior.reduce((sum, a) => sum + a.totalChanges, 0) / 
    Math.max(this.answerBehavior.length, 1);
  if (avgChanges > 3) {
    score -= (avgChanges - 3) * 2;
  }

  this.integrityScore = Math.max(0, Math.min(100, Math.round(score)));
  return this.integrityScore;
};

quizSessionBehaviorSchema.methods.calculateEngagementScore = function () {
  if (this.totalDuration === 0) {
    this.engagementScore = 100;
    return this.engagementScore;
  }

  const idleRatio = this.idleTime / this.totalDuration;
  let score = 100 - (idleRatio * 50);

  const avgTimePerQuestion = this.totalDuration / Math.max(this.questionTimings.length, 1);
  if (avgTimePerQuestion < 5000) score -= 10;
  if (avgTimePerQuestion > 120000) score -= 15;

  this.engagementScore = Math.max(0, Math.min(100, Math.round(score)));
  return this.engagementScore;
};

quizSessionBehaviorSchema.methods.calculateFocusScore = function () {
  let score = 100;
  const tabSwitches = this.integrityEvents.filter(e => e.type === "tab_switch").length;
  const focusLosses = this.integrityEvents.filter(e => e.type === "focus_lost").length;

  score -= tabSwitches * 5;
  score -= focusLosses * 3;

  const idleRatio = this.idleTime / Math.max(this.totalDuration, 1);
  score -= idleRatio * 20;

  this.focusScore = Math.max(0, Math.min(100, Math.round(score)));
  return this.focusScore;
};

quizSessionBehaviorSchema.methods.calculateConfidenceScore = function () {
  if (this.answerBehavior.length === 0) {
    this.confidenceScore = 100;
    return this.confidenceScore;
  }

  let score = 100;
  const totalChanges = this.answerBehavior.reduce((sum, a) => sum + a.totalChanges, 0);
  const avgChanges = totalChanges / this.answerBehavior.length;

  score -= avgChanges * 10;

  const skippedCount = this.answerBehavior.filter(a => a.wasSkipped).length;
  const skipRatio = skippedCount / this.answerBehavior.length;
  score -= skipRatio * 20;

  const revisitedCount = this.answerBehavior.filter(a => a.wasRevisited).length;
  const revisitRatio = revisitedCount / this.answerBehavior.length;
  score -= revisitRatio * 5;

  this.confidenceScore = Math.max(0, Math.min(100, Math.round(score)));
  return this.confidenceScore;
};

quizSessionBehaviorSchema.methods.calculateAllScores = function () {
  this.calculateIntegrityScore();
  this.calculateEngagementScore();
  this.calculateFocusScore();
  this.calculateConfidenceScore();
  this.checkForFlags();
  return this;
};

quizSessionBehaviorSchema.methods.checkForFlags = function () {
  const flags = [];

  if (this.integrityScore < 70) {
    flags.push("Low integrity score");
  }

  const tabSwitches = this.integrityEvents.filter(e => e.type === "tab_switch").length;
  if (tabSwitches > 5) {
    flags.push("Excessive tab switching");
  }

  const copyPasteAttempts = this.integrityEvents.filter(
    e => e.type === "copy_attempt" || e.type === "paste_attempt"
  ).length;
  if (copyPasteAttempts > 0) {
    flags.push("Copy/paste attempts detected");
  }

  const longTabSwitches = this.integrityEvents.filter(
    e => e.type === "tab_switch" && e.duration > 30000
  ).length;
  if (longTabSwitches > 0) {
    flags.push("Extended time away from quiz");
  }

  this.flaggedForReview = flags.length > 0;
  this.flagReasons = flags;
  return flags;
};

quizSessionBehaviorSchema.statics.getByQuizAttempt = function (quizAttemptId) {
  return this.findOne({ quizAttemptId });
};

quizSessionBehaviorSchema.statics.getFlaggedSessions = function (filters = {}) {
  const query = { flaggedForReview: true };

  if (filters.userId) query.userId = filters.userId;
  if (filters.reviewed === false) query.reviewedAt = { $exists: false };
  if (filters.reviewed === true) query.reviewedAt = { $exists: true };

  return this.find(query)
    .populate("userId", "firstName lastName email")
    .populate("quizAttemptId", "title mode score")
    .sort({ createdAt: -1 });
};

quizSessionBehaviorSchema.statics.getIntegrityStats = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        averageIntegrity: { $avg: "$integrityScore" },
        averageEngagement: { $avg: "$engagementScore" },
        averageFocus: { $avg: "$focusScore" },
        averageConfidence: { $avg: "$confidenceScore" },
        totalSessions: { $sum: 1 },
        flaggedCount: {
          $sum: { $cond: ["$flaggedForReview", 1, 0] },
        },
      },
    },
  ]);
};

quizSessionBehaviorSchema.index({ userId: 1, createdAt: -1 });
quizSessionBehaviorSchema.index({ flaggedForReview: 1, reviewedAt: 1 });

export default mongoose.model("QuizSessionBehavior", quizSessionBehaviorSchema);
