import mongoose from "mongoose";

const userBehaviorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    averageSessionDuration: {
      type: Number,
      default: 0,
    },
    averageQuestionTime: {
      type: Number,
      default: 30000,
    },
    typicalAnswerChangeRate: {
      type: Number,
      default: 0,
    },
    peakStudyHours: {
      type: [Number],
      default: [],
    },
    preferredStudyDays: {
      type: [String],
      default: [],
    },
    learningPace: {
      type: String,
      enum: ["fast", "moderate", "slow"],
      default: "moderate",
    },
    reviewPreference: {
      type: String,
      enum: ["spaced", "cramming", "mixed"],
      default: "mixed",
    },
    baselineTabSwitchRate: {
      type: Number,
      default: 0,
    },
    baselineFocusLossRate: {
      type: Number,
      default: 0,
    },
    anomalyThreshold: {
      type: Number,
      default: 2,
    },
    optimalRetention: {
      type: Number,
      default: 0.9,
      min: 0.7,
      max: 0.97,
    },
    personalizedWeights: {
      type: [Number],
      default: [],
    },
    lastOptimizedAt: Date,
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    riskFactors: {
      type: [String],
      default: [],
    },
    totalQuizzesTaken: {
      type: Number,
      default: 0,
    },
    averageIntegrityScore: {
      type: Number,
      default: 100,
    },
    averageEngagementScore: {
      type: Number,
      default: 100,
    },
    averageFocusScore: {
      type: Number,
      default: 100,
    },
    averageConfidenceScore: {
      type: Number,
      default: 100,
    },
    totalStudyTime: {
      type: Number,
      default: 0,
    },
    lastActivityAt: Date,
    behaviorChangeDetected: {
      type: Boolean,
      default: false,
    },
    interventionHistory: [
      {
        type: {
          type: String,
          required: true,
        },
        triggeredAt: {
          type: Date,
          default: Date.now,
        },
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notes: String,
      },
    ],
    autoInterventions: {
      recommendedSessionLength: Number,
      breakReminders: Boolean,
      gamificationBoost: Boolean,
      varietyInQuestions: Boolean,
      difficultyReduction: Boolean,
      reviewMode: Boolean,
      strictMode: Boolean,
      proctoringLevel: String,
      lastAppliedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

userBehaviorProfileSchema.methods.updateFromSession = async function (sessionBehavior) {
  const n = this.totalQuizzesTaken;
  const newN = n + 1;

  this.averageSessionDuration = (this.averageSessionDuration * n + sessionBehavior.totalDuration) / newN;
  this.averageIntegrityScore = (this.averageIntegrityScore * n + sessionBehavior.integrityScore) / newN;
  this.averageEngagementScore = (this.averageEngagementScore * n + sessionBehavior.engagementScore) / newN;
  this.averageFocusScore = (this.averageFocusScore * n + sessionBehavior.focusScore) / newN;
  this.averageConfidenceScore = (this.averageConfidenceScore * n + sessionBehavior.confidenceScore) / newN;

  if (sessionBehavior.questionTimings?.length > 0) {
    const avgTime = sessionBehavior.questionTimings.reduce((sum, q) => sum + q.totalTime, 0) / 
      sessionBehavior.questionTimings.length;
    this.averageQuestionTime = (this.averageQuestionTime * n + avgTime) / newN;
  }

  if (sessionBehavior.answerBehavior?.length > 0) {
    const changeRate = sessionBehavior.answerBehavior.reduce((sum, a) => sum + a.totalChanges, 0) / 
      sessionBehavior.answerBehavior.length;
    this.typicalAnswerChangeRate = (this.typicalAnswerChangeRate * n + changeRate) / newN;
  }

  const tabSwitches = sessionBehavior.integrityEvents?.filter(e => e.type === "tab_switch").length || 0;
  const focusLosses = sessionBehavior.integrityEvents?.filter(e => e.type === "focus_lost").length || 0;
  this.baselineTabSwitchRate = (this.baselineTabSwitchRate * n + tabSwitches) / newN;
  this.baselineFocusLossRate = (this.baselineFocusLossRate * n + focusLosses) / newN;

  this.totalQuizzesTaken = newN;
  this.totalStudyTime += sessionBehavior.totalDuration;
  this.lastActivityAt = new Date();

  this.updateLearningPace();
  this.updateRiskLevel();

  return this.save();
};

userBehaviorProfileSchema.methods.updateLearningPace = function () {
  if (this.averageQuestionTime < 20000) {
    this.learningPace = "fast";
  } else if (this.averageQuestionTime > 60000) {
    this.learningPace = "slow";
  } else {
    this.learningPace = "moderate";
  }
};

userBehaviorProfileSchema.methods.updateRiskLevel = function () {
  const risks = [];

  if (this.averageIntegrityScore < 70) {
    risks.push("Low average integrity");
  }
  if (this.averageEngagementScore < 60) {
    risks.push("Low engagement");
  }
  if (this.baselineTabSwitchRate > 5) {
    risks.push("Frequent tab switching");
  }
  if (this.typicalAnswerChangeRate > 3) {
    risks.push("High answer uncertainty");
  }

  this.riskFactors = risks;
  if (risks.length >= 3) {
    this.riskLevel = "high";
  } else if (risks.length >= 1) {
    this.riskLevel = "medium";
  } else {
    this.riskLevel = "low";
  }
};

userBehaviorProfileSchema.methods.calculateOptimalRetention = function () {
  let retention = 0.9;

  const paceModifier = { fast: 0.02, moderate: 0, slow: -0.02 };
  const prefModifier = { spaced: 0.02, mixed: 0, cramming: -0.03 };

  retention += paceModifier[this.learningPace] || 0;
  retention += prefModifier[this.reviewPreference] || 0;

  if (this.averageConfidenceScore > 80) retention += 0.01;
  if (this.averageConfidenceScore < 60) retention -= 0.02;

  this.optimalRetention = Math.min(0.97, Math.max(0.7, retention));
  return this.optimalRetention;
};

userBehaviorProfileSchema.methods.shouldOptimizeFSRS = async function () {
  const UserQuestionHistory = mongoose.model("UserQuestionHistory");
  const historyCount = await UserQuestionHistory.countDocuments({ userId: this.userId });

  if (!this.lastOptimizedAt && historyCount >= 500) return true;

  if (this.lastOptimizedAt) {
    const daysSince = (Date.now() - this.lastOptimizedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= 30) return true;
  }

  if (this.behaviorChangeDetected) return true;

  return false;
};

userBehaviorProfileSchema.statics.getOrCreate = async function (userId) {
  let profile = await this.findOne({ userId });

  if (!profile) {
    profile = await this.create({ userId });
  }

  return profile;
};

userBehaviorProfileSchema.statics.getTopPerformers = function (limit = 10) {
  return this.find({ totalQuizzesTaken: { $gte: 5 } })
    .sort({ averageIntegrityScore: -1, averageEngagementScore: -1 })
    .limit(limit)
    .populate("userId", "firstName lastName");
};

userBehaviorProfileSchema.statics.getAtRiskUsers = function () {
  return this.find({
    $or: [
      { riskLevel: "high" },
      { averageIntegrityScore: { $lt: 60 } },
      { averageEngagementScore: { $lt: 50 } },
    ],
  })
    .populate("userId", "firstName lastName email")
    .sort({ riskLevel: -1, averageIntegrityScore: 1 });
};

export default mongoose.model("UserBehaviorProfile", userBehaviorProfileSchema);
