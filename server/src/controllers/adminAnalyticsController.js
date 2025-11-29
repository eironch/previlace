import fsrsAnalyticsService from "../services/fsrsAnalyticsService.js";
import behaviorAnalyticsService from "../services/behaviorAnalyticsService.js";
import dssService from "../services/dssService.js";
import fsrsOptimizationService from "../services/fsrsOptimizationService.js";
import QuizSessionBehavior from "../models/QuizSessionBehavior.js";
import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const adminAnalyticsController = {
  async getFSRSHealth(req, res, next) {
    try {
      const health = await fsrsAnalyticsService.getFSRSHealthSummary();
      res.json({ success: true, data: health });
    } catch (error) {
      next(error);
    }
  },

  async getRetentionCurve(req, res, next) {
    try {
      const data = await fsrsAnalyticsService.getRetentionCurveData();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getWorkloadProjection(req, res, next) {
    try {
      const { days } = req.query;
      const data = await fsrsAnalyticsService.getWorkloadProjection(
        days ? parseInt(days) : 7
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAccuracyMetrics(req, res, next) {
    try {
      const data = await fsrsAnalyticsService.getAccuracyMetrics();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getParameterDistribution(req, res, next) {
    try {
      const data = await fsrsAnalyticsService.getParameterDistribution();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getContentEffectiveness(req, res, next) {
    try {
      const data = await fsrsAnalyticsService.getContentEffectiveness();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSubjectCompletionRates(req, res, next) {
    try {
      const data = await fsrsAnalyticsService.getSubjectCompletionRates();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getBehaviorHeatmap(req, res, next) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sessions = await QuizSessionBehavior.find({
        createdAt: { $gte: thirtyDaysAgo },
      }).select("createdAt");

      const heatmapData = [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          heatmapData.push({ day: days[day], hour, sessions: 0 });
        }
      }

      sessions.forEach((session) => {
        const date = new Date(session.createdAt);
        const dayIndex = date.getDay();
        const hour = date.getHours();
        const index = dayIndex * 24 + hour;
        if (heatmapData[index]) {
          heatmapData[index].sessions++;
        }
      });

      const maxSessions = Math.max(...heatmapData.map((d) => d.sessions));

      res.json({
        success: true,
        data: { heatmap: heatmapData, maxValue: maxSessions },
      });
    } catch (error) {
      next(error);
    }
  },

  async getSystemHealth(req, res, next) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        todaySessions,
        weekSessions,
        avgScores,
        activeUsers,
        totalProfiles,
      ] = await Promise.all([
        QuizSessionBehavior.countDocuments({ createdAt: { $gte: today } }),
        QuizSessionBehavior.countDocuments({ createdAt: { $gte: weekAgo } }),
        QuizSessionBehavior.aggregate([
          { $match: { createdAt: { $gte: weekAgo } } },
          {
            $group: {
              _id: null,
              avgIntegrity: { $avg: "$integrityScore" },
              avgEngagement: { $avg: "$engagementScore" },
              avgFocus: { $avg: "$focusScore" },
            },
          },
        ]),
        UserBehaviorProfile.countDocuments({ totalQuizzesTaken: { $gte: 1 } }),
        UserBehaviorProfile.countDocuments({}),
      ]);

      res.json({
        success: true,
        data: {
          sessions: {
            today: todaySessions,
            week: weekSessions,
            avgPerDay: Math.round(weekSessions / 7),
          },
          averages: avgScores[0] || {
            avgIntegrity: 100,
            avgEngagement: 100,
            avgFocus: 100,
          },
          users: {
            active: activeUsers,
            total: totalProfiles,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserBehaviorTimeline(req, res, next) {
    try {
      const { userId } = req.params;
      const { days } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days ? parseInt(days) : 30));

      const sessions = await QuizSessionBehavior.find({
        userId,
        createdAt: { $gte: startDate },
      })
        .sort({ createdAt: 1 })
        .populate("quizAttemptId", "title score totalQuestions mode")
        .select("createdAt integrityScore engagementScore focusScore confidenceScore totalDuration integrityEvents flaggedForReview");

      const timeline = sessions.map((session) => ({
        id: session._id,
        date: session.createdAt,
        integrityScore: session.integrityScore,
        engagementScore: session.engagementScore,
        focusScore: session.focusScore,
        confidenceScore: session.confidenceScore,
        duration: Math.round((session.totalDuration || 0) / 60000),
        integrityEventCount: session.integrityEvents?.length || 0,
        flagged: session.flaggedForReview,
        quiz: session.quizAttemptId
          ? {
              title: session.quizAttemptId.title,
              score: session.quizAttemptId.score,
              total: session.quizAttemptId.totalQuestions,
              mode: session.quizAttemptId.mode,
            }
          : null,
      }));

      res.json({ success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  },

  async getAggregatedBehaviorTrends(req, res, next) {
    try {
      const { days } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days ? parseInt(days) : 30));

      const sessions = await QuizSessionBehavior.find({
        createdAt: { $gte: startDate },
      })
        .sort({ createdAt: 1 })
        .select("createdAt integrityScore engagementScore focusScore");

      const dateMap = {};

      sessions.forEach((session) => {
        const dateKey = session.createdAt.toISOString().split("T")[0];
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { integrity: [], engagement: [], focus: [], count: 0 };
        }
        dateMap[dateKey].integrity.push(session.integrityScore || 100);
        dateMap[dateKey].engagement.push(session.engagementScore || 100);
        dateMap[dateKey].focus.push(session.focusScore || 100);
        dateMap[dateKey].count++;
      });

      const trends = Object.entries(dateMap).map(([date, data]) => {
        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        return {
          date,
          integrity: Math.round(avg(data.integrity)),
          engagement: Math.round(avg(data.engagement)),
          focus: Math.round(avg(data.focus)),
          sessionCount: data.count,
        };
      });

      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  },

  async getOptimizationQueue(req, res, next) {
    try {
      const totalUsers = await UserBehaviorProfile.countDocuments({ totalQuizzesTaken: { $gte: 5 } });
      const optimizedUsers = await UserBehaviorProfile.countDocuments({ lastOptimizedAt: { $exists: true } });

      const pendingProfiles = await UserBehaviorProfile.find({
        $or: [
          { lastOptimizedAt: { $exists: false }, totalQuizzesTaken: { $gte: 20 } },
          { behaviorChangeDetected: true },
        ],
      })
        .limit(50)
        .select("userId totalQuizzesTaken lastOptimizedAt behaviorChangeDetected updatedAt")
        .lean();

      const userIds = pendingProfiles.map((p) => p.userId);
      const users = await User.find({ _id: { $in: userIds } }).select("email").lean();
      const userMap = {};
      users.forEach((u) => {
        userMap[u._id.toString()] = u.email;
      });

      const pendingList = pendingProfiles.map((p) => ({
        userId: p.userId.toString(),
        email: userMap[p.userId.toString()] || "Unknown",
        reviewCount: p.totalQuizzesTaken || 0,
        lastActive: p.updatedAt,
        reason: p.behaviorChangeDetected ? "behavior_change" : "never_optimized",
      }));

      const lastOptimized = await UserBehaviorProfile.findOne({ lastOptimizedAt: { $exists: true } })
        .sort({ lastOptimizedAt: -1 })
        .select("lastOptimizedAt");

      res.json({
        success: true,
        data: {
          totalUsers,
          optimizedUsers,
          pendingOptimization: pendingProfiles.length,
          lastBatchOptimized: lastOptimized?.lastOptimizedAt || null,
          pendingList,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async triggerOptimization(req, res, next) {
    try {
      const { userIds } = req.body;
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: "No user IDs provided" });
      }

      const results = [];
      for (const userId of userIds.slice(0, 20)) {
        try {
          const result = await fsrsOptimizationService.optimizeForUser(userId);
          results.push({ userId, success: result.success, reason: result.reason });
        } catch (err) {
          results.push({ userId, success: false, reason: err.message });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      res.json({
        success: true,
        data: {
          processed: results.length,
          successful: successCount,
          failed: results.length - successCount,
          details: results,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserBehaviorAnomalies(req, res, next) {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const anomalies = await behaviorAnalyticsService.detectBehaviorAnomalies(userId);
      res.json({ success: true, data: anomalies });
    } catch (error) {
      next(error);
    }
  },

  async getUserLearningPatterns(req, res, next) {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const patterns = await behaviorAnalyticsService.getLearningPatternAnalysis(userId);
      res.json({ success: true, data: patterns });
    } catch (error) {
      next(error);
    }
  },
};

export default adminAnalyticsController;
