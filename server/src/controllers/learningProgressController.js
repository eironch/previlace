import UserProgress from "../models/UserProgress.js";
import Topic from "../models/Topic.js";
import { AppError } from "../utils/AppError.js";

export const trackView = async (req, res, next) => {
  try {
    const { topicId, timeSpent } = req.body;
    const userId = req.user._id;

    if (!topicId) {
      return next(new AppError("Topic ID is required", 400));
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return next(new AppError("Topic not found", 404));
    }

    let progress = await UserProgress.findOne({ userId, subjectId: topic.subjectId });

    if (!progress) {
      progress = await UserProgress.create({
        userId,
        subjectId: topic.subjectId,
        topicProgress: [],
      });
    }

    const topicProgress = progress.topicProgress.find(
      (tp) => tp.topicId.toString() === topicId
    );

    if (topicProgress) {
      topicProgress.learningContentViewed = true;
      if (!topicProgress.learningContentViewedAt) {
        topicProgress.learningContentViewedAt = new Date();
      }
      topicProgress.learningContentTimeSpent = (topicProgress.learningContentTimeSpent || 0) + (timeSpent || 0);
      
      // Update mastery level if not started
      if (topicProgress.masteryLevel === "not_started") {
        topicProgress.masteryLevel = "learning";
      }
    } else {
      progress.topicProgress.push({
        topicId,
        learningContentViewed: true,
        learningContentViewedAt: new Date(),
        learningContentTimeSpent: timeSpent || 0,
        masteryLevel: "learning",
        attempts: 0,
        bestScore: 0
      });
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return next(new AppError("Topic not found", 404));
    }

    const progress = await UserProgress.findOne({ userId, subjectId: topic.subjectId });
    
    let status = {
      hasViewedContent: false,
      masteryLevel: "not_started",
      canTakePracticeTest: true, // CEVAS flow might restrict this, but for now we allow it with recommendation
      recommendedAction: "read_content"
    };

    if (progress) {
      const topicProgress = progress.topicProgress.find(
        (tp) => tp.topicId.toString() === topicId
      );

      if (topicProgress) {
        status.hasViewedContent = topicProgress.learningContentViewed;
        status.masteryLevel = topicProgress.masteryLevel;
        
        if (topicProgress.masteryLevel === "mastered") {
          status.recommendedAction = "review_periodically";
        } else if (topicProgress.masteryLevel === "competent") {
          status.recommendedAction = "practice_more";
        } else if (topicProgress.learningContentViewed) {
          status.recommendedAction = "take_practice_test";
        }
      }
    }

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const markComplete = async (req, res, next) => {
  try {
    const { topicId, timeSpent } = req.body;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return next(new AppError("Topic not found", 404));
    }

    let progress = await UserProgress.findOne({ userId, subjectId: topic.subjectId });

    if (!progress) {
        // Should usually exist if they are marking complete, but handle just in case
        progress = await UserProgress.create({
            userId,
            subjectId: topic.subjectId,
            topicProgress: []
        });
    }

    const topicProgress = progress.topicProgress.find(
      (tp) => tp.topicId.toString() === topicId
    );

    if (topicProgress) {
      topicProgress.learningContentViewed = true;
      topicProgress.learningContentViewedAt = topicProgress.learningContentViewedAt || new Date();
      topicProgress.learningContentTimeSpent = (topicProgress.learningContentTimeSpent || 0) + (timeSpent || 0);
      
      // If they explicitly mark complete, we can assume they are ready for practice
      if (topicProgress.masteryLevel === "not_started") {
          topicProgress.masteryLevel = "learning";
      }
    } else {
        progress.topicProgress.push({
            topicId,
            learningContentViewed: true,
            learningContentViewedAt: new Date(),
            learningContentTimeSpent: timeSpent || 0,
            masteryLevel: "learning"
        });
    }

    await progress.save();

    res.status(200).json({
      success: true,
      unlockedPracticeTest: true,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  trackView,
  getStatus,
  markComplete,
};
