import ManualQuestion from "../models/ManualQuestion.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import Topic from "../models/Topic.js";
import sm2AlgorithmService from "./sm2AlgorithmService.js";

class EnhancedQuestionSelectionService {
  async selectQuestionsForSession(userId, config) {
    const {
      categories = [],
      difficulty = "",
      examLevel = "",
      questionCount = 10,
      mode = "practice",
      topicId = null,
      subjectId = null,
    } = config;

    const distribution = sm2AlgorithmService.getReviewDistribution(questionCount);
    const selectedQuestions = [];

    const dueQuestions = await this.getDueForReviewQuestions(
      userId,
      examLevel,
      distribution.dueForReview,
      topicId,
      subjectId
    );
    selectedQuestions.push(...dueQuestions);

    const weakQuestions = await this.getWeakAreaQuestions(
      userId,
      examLevel,
      distribution.weakAreas,
      selectedQuestions.map((q) => q._id),
      topicId,
      subjectId
    );
    selectedQuestions.push(...weakQuestions);

    const newQuestions = await this.getNewQuestions(
      userId,
      examLevel,
      distribution.newQuestions,
      selectedQuestions.map((q) => q._id),
      topicId,
      subjectId,
      difficulty
    );
    selectedQuestions.push(...newQuestions);

    const reinforcementQuestions = await this.getReinforcementQuestions(
      userId,
      examLevel,
      distribution.reinforcement,
      selectedQuestions.map((q) => q._id),
      topicId,
      subjectId
    );
    selectedQuestions.push(...reinforcementQuestions);

    if (selectedQuestions.length < questionCount) {
      const remaining = questionCount - selectedQuestions.length;
      const fallbackQuestions = await this.getFallbackQuestions(
        examLevel,
        remaining,
        selectedQuestions.map((q) => q._id),
        topicId,
        subjectId
      );
      selectedQuestions.push(...fallbackQuestions);
    }

    return sm2AlgorithmService.selectQuestionsWithInterleaving(
      selectedQuestions,
      questionCount
    );
  }

  async getDueForReviewQuestions(userId, examLevel, count, topicId, subjectId) {
    if (count <= 0) return [];

    const dueHistories = await UserQuestionHistory.find({
      userId,
      "spacedRepetitionData.nextReviewDate": { $lte: new Date() },
      masteryLevel: { $ne: "mastered" },
    })
      .sort({ "spacedRepetitionData.nextReviewDate": 1 })
      .limit(count * 2)
      .populate("questionId");

    const validHistories = dueHistories.filter((h) => {
      if (!h.questionId || !h.questionId.isActive) return false;
      if (topicId && h.questionId.topicId?.toString() !== topicId.toString()) return false;
      return true;
    });

    const questionsWithPriority = validHistories.map((h) => {
      const question = h.questionId;
      question.priority = sm2AlgorithmService.calculatePriority(h);
      question.historyData = h;
      return question;
    });

    questionsWithPriority.sort((a, b) => b.priority - a.priority);

    return questionsWithPriority.slice(0, count);
  }

  async getWeakAreaQuestions(userId, examLevel, count, excludeIds, topicId, subjectId) {
    if (count <= 0) return [];

    const weakHistories = await UserQuestionHistory.find({
      userId,
      isWeakArea: true,
      questionId: { $nin: excludeIds },
    })
      .sort({ weaknessScore: -1 })
      .limit(count * 2)
      .populate("questionId");

    const validQuestions = weakHistories
      .filter((h) => {
        if (!h.questionId || !h.questionId.isActive) return false;
        if (topicId && h.questionId.topicId?.toString() !== topicId.toString()) return false;
        return true;
      })
      .map((h) => {
        const q = h.questionId;
        q.priority = h.weaknessScore;
        return q;
      });

    return validQuestions.slice(0, count);
  }

  async getNewQuestions(userId, examLevel, count, excludeIds, topicId, subjectId, difficulty) {
    if (count <= 0) return [];

    const answeredQuestionIds = await UserQuestionHistory.distinct("questionId", {
      userId,
    });

    const allExcludeIds = [...excludeIds, ...answeredQuestionIds];

    const query = {
      _id: { $nin: allExcludeIds },
      status: "published",
      isActive: true,
    };

    if (topicId) {
      query.topicId = topicId;
    } else if (subjectId) {
      const topics = await Topic.find({ subjectId, isActive: true });
      query.topicId = { $in: topics.map((t) => t._id) };
    }

    if (examLevel) {
      const normalizedLevel = examLevel.replace(/-/g, "").toLowerCase();
      query.$or = [
        { examLevel: { $regex: new RegExp(`^${examLevel}$`, "i") } },
        { examLevel: { $regex: new RegExp(`^${normalizedLevel}$`, "i") } },
        { examLevel: "Both" },
      ];
    }

    if (difficulty) {
      query.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") };
    }

    const questions = await ManualQuestion.aggregate([
      { $match: query },
      { $sample: { size: count * 2 } },
    ]);

    return questions.slice(0, count);
  }

  async getReinforcementQuestions(userId, examLevel, count, excludeIds, topicId, subjectId) {
    if (count <= 0) return [];

    const masteredHistories = await UserQuestionHistory.find({
      userId,
      masteryLevel: { $in: ["advanced", "mastered"] },
      questionId: { $nin: excludeIds },
      "spacedRepetitionData.interval": { $gte: 14 },
    })
      .sort({ "spacedRepetitionData.lastReviewedAt": 1 })
      .limit(count * 2)
      .populate("questionId");

    const validQuestions = masteredHistories
      .filter((h) => {
        if (!h.questionId || !h.questionId.isActive) return false;
        if (topicId && h.questionId.topicId?.toString() !== topicId.toString()) return false;
        return true;
      })
      .map((h) => h.questionId);

    return validQuestions.slice(0, count);
  }

  async getFallbackQuestions(examLevel, count, excludeIds, topicId, subjectId) {
    if (count <= 0) return [];

    const query = {
      _id: { $nin: excludeIds },
      status: "published",
      isActive: true,
    };

    if (topicId) {
      query.topicId = topicId;
    } else if (subjectId) {
      const topics = await Topic.find({ subjectId, isActive: true });
      query.topicId = { $in: topics.map((t) => t._id) };
    }

    if (examLevel) {
      const normalizedLevel = examLevel.replace(/-/g, "").toLowerCase();
      query.$or = [
        { examLevel: { $regex: new RegExp(`^${examLevel}$`, "i") } },
        { examLevel: { $regex: new RegExp(`^${normalizedLevel}$`, "i") } },
        { examLevel: "Both" },
      ];
    }

    const questions = await ManualQuestion.aggregate([
      { $match: query },
      { $sample: { size: count } },
    ]);

    return questions;
  }

  async processAnswerWithSM2(userId, questionId, isCorrect, responseTimeMs, question) {
    let history = await UserQuestionHistory.findOne({ userId, questionId });

    if (!history) {
      history = new UserQuestionHistory({
        userId,
        questionId,
        subject: question.subjectId || question.topicId,
        topic: question.topicId,
        spacedRepetitionData: {
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date(),
        },
      });
    }

    const avgTimeMs = history.averageResponseTime || 30000;
    const consecutiveCorrect = this.getConsecutiveCorrect(history.attempts || []);

    const qualityRating = sm2AlgorithmService.calculateQualityRating(
      isCorrect,
      responseTimeMs,
      avgTimeMs,
      consecutiveCorrect
    );

    const sm2Result = sm2AlgorithmService.calculateNextReview(
      history.spacedRepetitionData,
      qualityRating
    );

    history.spacedRepetitionData = {
      easeFactor: sm2Result.easeFactor,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      nextReviewDate: sm2Result.nextReviewDate,
      lastReviewedAt: sm2Result.lastReviewedAt,
      difficultyRating: qualityRating,
    };

    history.attempts.push({
      isCorrect,
      timeSpent: responseTimeMs,
      answeredAt: new Date(),
    });

    history.totalAttempts = (history.totalAttempts || 0) + 1;
    if (isCorrect) {
      history.correctAttempts = (history.correctAttempts || 0) + 1;
    } else {
      history.incorrectAttempts = (history.incorrectAttempts || 0) + 1;
    }

    history.lastAttemptAt = new Date();

    const accuracy = history.correctAttempts / history.totalAttempts;
    history.masteryLevel = sm2AlgorithmService.determineMasteryLevel(
      sm2Result.interval,
      sm2Result.repetitions,
      accuracy
    );

    history.weaknessScore = (1 - accuracy) * 100;
    history.isWeakArea = history.weaknessScore > 40 && history.totalAttempts >= 1;

    const totalTime = history.attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    history.averageResponseTime = totalTime / history.totalAttempts;

    await history.save();

    return {
      masteryLevel: history.masteryLevel,
      nextReviewDate: sm2Result.nextReviewDate,
      interval: sm2Result.interval,
      isWeakArea: history.isWeakArea,
    };
  }

  getConsecutiveCorrect(attempts) {
    let count = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i].isCorrect) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  async getRecentlyAnsweredQuestions(userId, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const histories = await UserQuestionHistory.find({
      userId,
      lastAttemptAt: { $gte: since },
    }).select("questionId");

    return histories.map((h) => h.questionId);
  }

  async getUserPerformanceMetrics(userId) {
    const histories = await UserQuestionHistory.find({ userId });

    if (histories.length === 0) {
      return {
        recentAccuracy: 0.5,
        averageTimePerQuestion: 30000,
        streak: 0,
        totalQuestionsAttempted: 0,
        masteryDistribution: {
          beginner: 0,
          intermediate: 0,
          advanced: 0,
          mastered: 0,
        },
      };
    }

    const recentHistories = histories.filter((h) => {
      if (!h.lastAttemptAt) return false;
      const daysSince = (new Date() - new Date(h.lastAttemptAt)) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    const recentAccuracy =
      recentHistories.length > 0
        ? recentHistories.reduce((sum, h) => {
            return sum + (h.totalAttempts > 0 ? h.correctAttempts / h.totalAttempts : 0);
          }, 0) / recentHistories.length
        : 0.5;

    const avgTime =
      histories.reduce((sum, h) => sum + (h.averageResponseTime || 30000), 0) /
      histories.length;

    const masteryDistribution = {
      beginner: histories.filter((h) => h.masteryLevel === "beginner").length,
      intermediate: histories.filter((h) => h.masteryLevel === "intermediate").length,
      advanced: histories.filter((h) => h.masteryLevel === "advanced").length,
      mastered: histories.filter((h) => h.masteryLevel === "mastered").length,
    };

    return {
      recentAccuracy,
      averageTimePerQuestion: avgTime,
      streak: 0,
      totalQuestionsAttempted: histories.length,
      masteryDistribution,
    };
  }
}

export default new EnhancedQuestionSelectionService();
