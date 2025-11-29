import dssService from "../services/dssService.js";
import interventionService from "../services/interventionService.js";
import learningPathService from "../services/learningPathService.js";
import adaptiveQuizService from "../services/adaptiveQuizService.js";

const dssController = {
  async getRecommendations(req, res) {
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

  async getLearningPath(req, res) {
    try {
      const userId = req.user._id;
      const { examLevel, daysAhead } = req.query;

      const learningPath = await learningPathService.generatePersonalizedPath(userId, {
        examLevel: examLevel || "Professional",
        daysAhead: parseInt(daysAhead) || 7,
      });

      res.status(200).json({
        success: true,
        data: learningPath,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting learning path:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getStudyStreak(req, res) {
    try {
      const userId = req.user._id;
      const streak = await learningPathService.getStudyStreak(userId);

      res.status(200).json({
        success: true,
        data: streak,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting study streak:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getWeeklyGoalProgress(req, res) {
    try {
      const userId = req.user._id;
      const progress = await learningPathService.getWeeklyGoalProgress(userId);

      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting weekly goal progress:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getPriorityTopics(req, res) {
    try {
      const userId = req.user._id;
      const topicMastery = await learningPathService.getTopicMasteryMap(userId);
      const fsrsStats = await dssService.getFSRSStats(userId);
      const priorityTopics = await learningPathService.getPriorityTopics(userId, topicMastery, fsrsStats);

      res.status(200).json({
        success: true,
        data: priorityTopics,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting priority topics:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async checkInterventions(req, res) {
    try {
      const userId = req.user._id;
      const interventions = await interventionService.checkInterventionTriggers(userId);

      res.status(200).json({
        success: true,
        data: interventions,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking interventions:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async applyAutoIntervention(req, res) {
    try {
      const userId = req.user._id;
      const { type } = req.params;

      const result = await interventionService.applyAutoIntervention(userId, type);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error applying auto intervention:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAdminInterventionDashboard(req, res) {
    try {
      const dashboard = await interventionService.getAdminInterventionDashboard();

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting admin intervention dashboard:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAdminDSSMetrics(req, res) {
    try {
      const metrics = await dssService.getAdminDSSMetrics();

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting admin DSS metrics:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async recordIntervention(req, res) {
    try {
      const { userId } = req.params;
      const { interventionType, notes } = req.body;
      const adminId = req.user._id;

      const profile = await interventionService.recordIntervention(
        userId,
        interventionType,
        adminId,
        notes
      );

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error recording intervention:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async createAdaptedQuiz(req, res) {
    try {
      const userId = req.user._id;
      const { subjectId, examLevel, questionCount } = req.body;

      if (!subjectId) {
        return res.status(400).json({
          success: false,
          message: "Subject ID is required",
        });
      }

      const quiz = await adaptiveQuizService.createBehaviorAdaptedQuiz(
        userId,
        subjectId,
        examLevel || "Professional",
        questionCount || 20
      );

      res.status(200).json({
        success: true,
        data: quiz,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating adapted quiz:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getPredictiveAnalytics(req, res) {
    try {
      const userId = req.user._id;
      const predictions = await dssService.getPredictiveAnalytics(userId);

      res.status(200).json({
        success: true,
        data: predictions,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting predictive analytics:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getTopicPredictions(req, res) {
    try {
      const userId = req.user._id;
      const { topicId } = req.params;

      const predictions = await dssService.getTopicLevelPredictions(userId, topicId);

      res.status(200).json({
        success: true,
        data: predictions,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting topic predictions:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getStudyLoadForecast(req, res) {
    try {
      const userId = req.user._id;
      const { days } = req.query;

      const forecast = await dssService.getStudyLoadForecast(
        userId,
        days ? parseInt(days) : 7
      );

      res.status(200).json({
        success: true,
        data: forecast,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting study load forecast:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getPerformanceTrend(req, res) {
    try {
      const userId = req.user._id;
      const { days } = req.query;

      const trend = await dssService.getPerformanceTrend(
        userId,
        days ? parseInt(days) : 30
      );

      res.status(200).json({
        success: true,
        data: trend,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting performance trend:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getExamCountdownPlan(req, res) {
    try {
      const userId = req.user._id;
      const { examDate, examLevel } = req.query;

      if (!examDate) {
        return res.status(400).json({
          success: false,
          message: "examDate query parameter is required",
        });
      }

      const plan = await dssService.getExamCountdownPlan(
        userId,
        examDate,
        examLevel || "Professional"
      );

      if (plan.error) {
        return res.status(400).json({
          success: false,
          message: plan.message,
        });
      }

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting exam countdown plan:", error);
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default dssController;
