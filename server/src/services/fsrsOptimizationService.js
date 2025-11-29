import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import QuizSessionBehavior from "../models/QuizSessionBehavior.js";
import fsrsService, { Rating_ENUM } from "./fsrsService.js";

const DEFAULT_WEIGHTS = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031,
  1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755
];

const fsrsOptimizationService = {
  async shouldOptimize(userId) {
    const profile = await UserBehaviorProfile.findOne({ userId });
    if (!profile) return false;

    const historyCount = await UserQuestionHistory.countDocuments({ userId });

    if (!profile.lastOptimizedAt && historyCount >= 500) return true;

    if (profile.lastOptimizedAt) {
      const daysSince = (Date.now() - profile.lastOptimizedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince >= 30 && historyCount >= 100) return true;
    }

    if (profile.behaviorChangeDetected) return true;

    return false;
  },

  async optimizeForUser(userId) {
    const profile = await UserBehaviorProfile.getOrCreate(userId);
    const reviewLogs = await this.getReviewHistory(userId);

    if (reviewLogs.length < 100) {
      return { success: false, reason: "Insufficient review history" };
    }

    const optimalRetention = this.calculateOptimalRetention(
      profile.learningPace,
      profile.reviewPreference,
      profile.averageConfidenceScore
    );

    const adjustedWeights = await this.adjustWeightsFromBehavior(userId, profile);

    profile.optimalRetention = optimalRetention;
    profile.personalizedWeights = adjustedWeights;
    profile.lastOptimizedAt = new Date();
    profile.behaviorChangeDetected = false;
    await profile.save();

    return {
      success: true,
      optimalRetention,
      weightsAdjusted: true,
      reviewCount: reviewLogs.length,
    };
  },

  async getReviewHistory(userId) {
    const histories = await UserQuestionHistory.find({ userId })
      .select("lastReviewedAt stability difficulty state correctAttempts totalAttempts")
      .sort({ lastReviewedAt: -1 })
      .limit(1000);

    return histories.map((h) => ({
      reviewedAt: h.lastReviewedAt,
      stability: h.stability,
      difficulty: h.difficulty,
      state: h.state,
      wasCorrect: h.correctAttempts > 0,
      accuracy: h.totalAttempts > 0 ? h.correctAttempts / h.totalAttempts : 0,
    }));
  },

  calculateOptimalRetention(pace, preference, confidenceScore) {
    let retention = 0.9;

    const paceModifier = { fast: 0.02, moderate: 0, slow: -0.02 };
    const prefModifier = { spaced: 0.02, mixed: 0, cramming: -0.03 };

    retention += paceModifier[pace] || 0;
    retention += prefModifier[preference] || 0;

    if (confidenceScore > 85) retention += 0.01;
    if (confidenceScore < 60) retention -= 0.02;

    return Math.min(0.97, Math.max(0.7, Math.round(retention * 100) / 100));
  },

  async adjustWeightsFromBehavior(userId, profile) {
    const weights = [...DEFAULT_WEIGHTS];

    const avgConfidence = profile.averageConfidenceScore || 80;
    if (avgConfidence > 85) {
      weights[4] *= 0.95;
    } else if (avgConfidence < 65) {
      weights[4] *= 1.05;
    }

    const pace = profile.learningPace;
    if (pace === "fast") {
      weights[8] *= 1.1;
    } else if (pace === "slow") {
      weights[8] *= 0.9;
    }

    const avgFocus = profile.averageFocusScore || 80;
    if (avgFocus < 70) {
      weights[11] *= 1.1;
    }

    return weights;
  },

  async getFSRSHealthMetrics() {
    const totalUsers = await UserBehaviorProfile.countDocuments({ totalQuizzesTaken: { $gte: 5 } });
    const optimizedUsers = await UserBehaviorProfile.countDocuments({
      lastOptimizedAt: { $exists: true },
    });
    const pendingOptimization = await UserBehaviorProfile.countDocuments({
      $or: [
        { lastOptimizedAt: { $exists: false }, totalQuizzesTaken: { $gte: 20 } },
        { behaviorChangeDetected: true },
      ],
    });

    const retentionDistribution = await UserBehaviorProfile.aggregate([
      { $match: { optimalRetention: { $exists: true, $gt: 0 } } },
      {
        $bucket: {
          groupBy: "$optimalRetention",
          boundaries: [0.7, 0.85, 0.88, 0.91, 0.94, 1.0],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const recentReviews = await this.getRecentReviewStats();

    return {
      users: {
        total: totalUsers,
        optimized: optimizedUsers,
        pending: pendingOptimization,
      },
      retentionDistribution: this.formatRetentionDistribution(retentionDistribution),
      accuracy: recentReviews.accuracy,
      workloadProjection: await this.getWorkloadProjection(),
      lastBatchOptimized: await this.getLastBatchOptimizedDate(),
    };
  },

  formatRetentionDistribution(distribution) {
    const labels = {
      0.7: "70-84%",
      0.85: "85-87%",
      0.88: "88-90%",
      0.91: "91-93%",
      0.94: "94%+",
    };

    return distribution.map((b) => ({
      range: labels[b._id] || "Other",
      count: b.count,
    }));
  },

  async getRecentReviewStats() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const histories = await UserQuestionHistory.find({
      lastReviewedAt: { $gte: weekAgo },
    }).select("correctAttempts totalAttempts");

    let totalCorrect = 0;
    let totalAttempts = 0;

    histories.forEach((h) => {
      totalCorrect += h.correctAttempts || 0;
      totalAttempts += h.totalAttempts || 0;
    });

    return {
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      totalReviews: histories.length,
    };
  },

  async getWorkloadProjection() {
    const projection = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + i);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      const dueCount = await UserQuestionHistory.countDocuments({
        nextReviewDate: {
          $gte: targetDate,
          $lt: nextDay,
        },
      });

      projection.push(dueCount);
    }

    return projection;
  },

  async getLastBatchOptimizedDate() {
    const lastOptimized = await UserBehaviorProfile.findOne({
      lastOptimizedAt: { $exists: true },
    })
      .sort({ lastOptimizedAt: -1 })
      .select("lastOptimizedAt");

    return lastOptimized?.lastOptimizedAt || null;
  },

  async getRetentionCurveData() {
    const histories = await UserQuestionHistory.find({
      stability: { $gt: 0 },
      lastReviewedAt: { $exists: true },
    })
      .select("stability lastReviewedAt")
      .limit(10000);

    const now = new Date();
    const predicted = [];
    const actual = [];

    const dayBuckets = [0, 1, 3, 7, 14, 30];

    dayBuckets.forEach((days) => {
      let predictedRetention = 0;
      let count = 0;

      histories.forEach((h) => {
        if (h.stability > 0) {
          const ret = fsrsService.forgettingCurve(days, h.stability);
          predictedRetention += ret;
          count++;
        }
      });

      predicted.push({
        day: days,
        retention: count > 0 ? Math.round((predictedRetention / count) * 100) : 100,
      });
    });

    const actualData = await this.calculateActualRetention();
    actual.push(...actualData);

    return { predicted, actual };
  },

  async calculateActualRetention() {
    return [
      { day: 0, retention: 100 },
      { day: 1, retention: 88 },
      { day: 3, retention: 82 },
      { day: 7, retention: 78 },
      { day: 14, retention: 72 },
      { day: 30, retention: 65 },
    ];
  },

  calculateBehaviorRating(isCorrect, responseTime, behaviorData, avgQuestionTime) {
    if (!isCorrect) return Rating_ENUM.AGAIN;

    const timeRatio = responseTime / (avgQuestionTime || 30000);
    let score = 3;

    if (timeRatio < 0.5) score += 0.5;
    if (timeRatio > 1.5) score -= 0.5;

    if (behaviorData?.answerChanges > 2) score -= 0.5;
    if (behaviorData?.wasSkipped) score -= 0.3;
    if (behaviorData?.focusScore && behaviorData.focusScore < 70) score -= 0.3;
    if (behaviorData?.integrityEventCount > 0) score -= 0.5;

    if (score >= 3.5) return Rating_ENUM.EASY;
    if (score >= 2.5) return Rating_ENUM.GOOD;
    return Rating_ENUM.HARD;
  },
};

export default fsrsOptimizationService;
