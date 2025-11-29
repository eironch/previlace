import behaviorAnalyticsService from "../services/behaviorAnalyticsService.js";
import integrityService from "../services/integrityService.js";
import dssService from "../services/dssService.js";
import fsrsOptimizationService from "../services/fsrsOptimizationService.js";
import QuizSessionBehavior from "../models/QuizSessionBehavior.js";

const behaviorAnalyticsController = {
  async saveQuizBehavior(req, res) {
    try {
      const userId = req.user._id;
      const { quizAttemptId, ...behaviorData } = req.body;

      if (!quizAttemptId) {
        return res.status(400).json({
          success: false,
          message: "Quiz attempt ID is required",
        });
      }

      const sessionBehavior = await behaviorAnalyticsService.saveQuizBehavior(
        userId,
        quizAttemptId,
        behaviorData
      );

      res.status(200).json({
        success: true,
        data: sessionBehavior,
      });
    } catch (error) {
      console.error("Error saving quiz behavior:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async batchSaveEvents(req, res) {
    try {
      const { events } = req.body;

      if (!events || !Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Events array is required",
        });
      }

      const groupedEvents = {};
      events.forEach((event) => {
        const key = event.quizAttemptId;
        if (!groupedEvents[key]) {
          groupedEvents[key] = [];
        }
        groupedEvents[key].push(event);
      });

      const results = [];
      for (const [quizAttemptId, eventList] of Object.entries(groupedEvents)) {
        const result = await behaviorAnalyticsService.addIntegrityEvents(
          quizAttemptId,
          eventList
        );
        if (result) results.push(result);
      }

      res.status(200).json({
        success: true,
        data: { processed: results.length },
      });
    } catch (error) {
      console.error("Error batch saving events:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getUserProfile(req, res) {
    try {
      const userId = req.user._id;
      const profile = await behaviorAnalyticsService.getUserBehaviorProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getQuizBehavior(req, res) {
    try {
      const { quizAttemptId } = req.params;
      const behavior = await behaviorAnalyticsService.getQuizBehavior(quizAttemptId);

      if (!behavior) {
        return res.status(404).json({
          success: false,
          message: "Quiz behavior not found",
        });
      }

      res.status(200).json({
        success: true,
        data: behavior,
      });
    } catch (error) {
      console.error("Error getting quiz behavior:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getIntegrityStats(req, res) {
    try {
      const userId = req.user._id;
      const stats = await behaviorAnalyticsService.getIntegrityStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting integrity stats:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getBehaviorTrends(req, res) {
    try {
      const userId = req.user._id;
      const days = parseInt(req.query.days) || 30;
      const trends = await behaviorAnalyticsService.getBehaviorTrends(userId, days);

      res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error) {
      console.error("Error getting behavior trends:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getFlaggedSessions(req, res) {
    try {
      const filters = {
        userId: req.query.userId,
        reviewed: req.query.reviewed === "true" ? true : req.query.reviewed === "false" ? false : undefined,
      };

      const sessions = await behaviorAnalyticsService.getFlaggedSessions(filters);

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      console.error("Error getting flagged sessions:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async reviewFlaggedSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { reviewNotes } = req.body;
      const reviewerId = req.user._id;

      const session = await behaviorAnalyticsService.reviewFlaggedSession(
        sessionId,
        reviewerId,
        reviewNotes
      );

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error("Error reviewing flagged session:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getSessionReplayUrl(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await QuizSessionBehavior.findById(sessionId);

      if (!session || !session.posthogSessionId) {
        return res.status(404).json({
          success: false,
          message: "Session or replay not found",
        });
      }

      const replayUrl = `https://app.posthog.com/replay/${session.posthogSessionId}`;

      res.status(200).json({
        success: true,
        data: { replayUrl },
      });
    } catch (error) {
      console.error("Error getting session replay URL:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getDSSRecommendations(req, res) {
    try {
      const userId = req.user._id;
      const recommendations = await dssService.generateRecommendations(userId);

      res.status(200).json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting DSS recommendations:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getFSRSHealth(req, res) {
    try {
      const health = await fsrsOptimizationService.getFSRSHealthMetrics();

      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting FSRS health:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getRetentionCurve(req, res) {
    try {
      const curve = await fsrsOptimizationService.getRetentionCurveData();

      res.status(200).json({
        success: true,
        data: curve,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting retention curve:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async optimizeUserFSRS(req, res) {
    try {
      const userId = req.params.userId || req.user._id;
      const result = await fsrsOptimizationService.optimizeForUser(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error optimizing FSRS:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getDSSMetrics(req, res) {
    try {
      const metrics = await dssService.getAdminDSSMetrics();

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting DSS metrics:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAdminOverview(req, res) {
    try {
      const overview = await behaviorAnalyticsService.getAdminOverview();

      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      console.error("Error getting admin overview:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAdminBehaviorPatterns(req, res) {
    try {
      const patterns = await behaviorAnalyticsService.getAdminBehaviorPatterns();

      res.status(200).json({
        success: true,
        data: patterns,
      });
    } catch (error) {
      console.error("Error getting admin behavior patterns:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getIntegrityDistribution(req, res) {
    try {
      const distribution = await behaviorAnalyticsService.getIntegrityDistribution();

      res.status(200).json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      console.error("Error getting integrity distribution:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getInterventionQueue(req, res) {
    try {
      const queue = await behaviorAnalyticsService.getInterventionQueue();

      res.status(200).json({
        success: true,
        data: queue,
      });
    } catch (error) {
      console.error("Error getting intervention queue:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getUserBehaviorDetail(req, res) {
    try {
      const { userId } = req.params;
      const detail = await behaviorAnalyticsService.getUserBehaviorDetail(userId);

      res.status(200).json({
        success: true,
        data: detail,
      });
    } catch (error) {
      console.error("Error getting user behavior detail:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  calculateSuggestedSessionLength(profile) {
    if (!profile) return 30;
    const avgDuration = profile.averageSessionDuration / 60000;
    if (avgDuration < 15) return 20;
    if (avgDuration > 60) return 45;
    return Math.round(avgDuration);
  },

  calculateDifficultyAdjustment(stats) {
    if (!stats?.aggregated) return "maintain";
    const avg = stats.aggregated;
    if (avg.averageIntegrity > 90 && avg.averageConfidence > 85) return "increase";
    if (avg.averageIntegrity < 70 || avg.averageConfidence < 60) return "decrease";
    return "maintain";
  },

  getFocusRecommendation(profile) {
    if (!profile) return "No data available";
    if (profile.averageFocusScore > 85) return "Excellent focus - maintain current habits";
    if (profile.averageFocusScore > 70) return "Good focus - minimize distractions";
    return "Consider shorter sessions with breaks";
  },

  identifyStrengths(stats) {
    const strengths = [];
    if (!stats?.aggregated) return strengths;
    const avg = stats.aggregated;
    if (avg.averageIntegrity > 90) strengths.push("High test integrity");
    if (avg.averageEngagement > 85) strengths.push("Strong engagement");
    if (avg.averageFocus > 85) strengths.push("Excellent focus");
    if (avg.averageConfidence > 85) strengths.push("High confidence");
    return strengths;
  },

  identifyImprovements(stats) {
    const improvements = [];
    if (!stats?.aggregated) return improvements;
    const avg = stats.aggregated;
    if (avg.averageIntegrity < 80) improvements.push("Reduce tab switching during quizzes");
    if (avg.averageEngagement < 75) improvements.push("Try shorter, more focused sessions");
    if (avg.averageFocus < 75) improvements.push("Minimize distractions while studying");
    if (avg.averageConfidence < 75) improvements.push("Review answers before moving on");
    return improvements;
  },

  calculateTrend(trends, metric) {
    if (!trends || trends.length < 2) return "stable";
    const recent = trends.slice(-7);
    const values = recent.map((t) => t[metric]);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const diff = secondAvg - firstAvg;
    if (diff > 5) return "improving";
    if (diff < -5) return "declining";
    return "stable";
  },
};

export default behaviorAnalyticsController;
