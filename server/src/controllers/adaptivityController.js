import adaptivityService from "../services/adaptivityService.js";
import questionPriorityService from "../services/questionPriorityService.js";

const adaptivityController = {
  async getAdaptedQuizConfig(req, res, next) {
    try {
      const userId = req.user._id;
      const { questionCount, examLevel, topicIds, mode } = req.query;

      const baseConfig = {
        questionCount: questionCount ? parseInt(questionCount, 10) : 20,
        examLevel: examLevel || "Professional",
        topicIds: topicIds ? topicIds.split(",") : [],
        mode: mode || "practice",
      };

      const result = await adaptivityService.getAdaptedQuizConfig(userId, baseConfig);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMidQuizAdjustments(req, res, next) {
    try {
      const { quizAttemptId } = req.params;
      const currentBehavior = req.body;

      const result = await adaptivityService.calculateMidQuizAdjustments(
        quizAttemptId,
        currentBehavior
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getQuestionPriority(req, res, next) {
    try {
      const userId = req.user._id;
      const { topicIds, count, examLevel } = req.query;

      if (!topicIds) {
        return res.status(400).json({
          success: false,
          message: "topicIds query parameter is required",
        });
      }

      const result = await questionPriorityService.getQuestionPriorityQueue(
        userId,
        topicIds.split(","),
        count ? parseInt(count, 10) : 20,
        { examLevel }
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSessionRecommendations(req, res, next) {
    try {
      const userId = req.user._id;

      const result = await adaptivityService.getSessionRecommendations(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getReviewSummary(req, res, next) {
    try {
      const userId = req.user._id;

      const result = await questionPriorityService.getReviewSummary(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getExamDayRecommendations(req, res, next) {
    try {
      const userId = req.user._id;
      const { examDate } = req.query;

      if (!examDate) {
        return res.status(400).json({
          success: false,
          message: "examDate query parameter is required",
        });
      }

      const result = await adaptivityService.getExamDayRecommendations(
        userId,
        new Date(examDate)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async recordBehaviorFeedback(req, res, next) {
    try {
      const userId = req.user._id;
      const { quizAttemptId } = req.params;
      const feedbackData = req.body;

      const result = await adaptivityService.recordBehaviorFeedback(
        userId,
        quizAttemptId,
        feedbackData
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default adaptivityController;
