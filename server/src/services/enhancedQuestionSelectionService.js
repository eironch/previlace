import ManualQuestion from "../models/ManualQuestion.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import Topic from "../models/Topic.js";
import fsrsService from "./fsrsService.js";

class EnhancedQuestionSelectionService {
  async selectQuestionsForSession(userId, config) {
    const {
      difficulty = "",
      examLevel = "",
      questionCount = 10,
      topicId = null,
      subjectId = null,
    } = config;

    const distribution = this.getReviewDistribution(questionCount);
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

    return this.selectQuestionsWithInterleaving(selectedQuestions, questionCount);
  }

  getReviewDistribution(totalQuestions) {
    return {
      dueForReview: Math.floor(totalQuestions * 0.4),
      weakAreas: Math.floor(totalQuestions * 0.3),
      newQuestions: Math.floor(totalQuestions * 0.2),
      reinforcement: Math.floor(totalQuestions * 0.1),
    };
  }

  selectQuestionsWithInterleaving(questions, targetCount) {
    const topicGroups = {};
    questions.forEach((q) => {
      const topicId = q.topicId?.toString() || "unknown";
      if (!topicGroups[topicId]) {
        topicGroups[topicId] = [];
      }
      topicGroups[topicId].push(q);
    });

    Object.values(topicGroups).forEach((group) => {
      group.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    });

    const selected = [];
    const topicKeys = Object.keys(topicGroups);
    let topicIndex = 0;

    while (selected.length < targetCount && topicKeys.length > 0) {
      const topicId = topicKeys[topicIndex % topicKeys.length];
      const group = topicGroups[topicId];

      if (group.length > 0) {
        selected.push(group.shift());
      }

      if (group.length === 0) {
        const idx = topicKeys.indexOf(topicId);
        topicKeys.splice(idx, 1);
        if (topicKeys.length > 0) {
          topicIndex = topicIndex % topicKeys.length;
        }
      } else {
        topicIndex++;
      }
    }

    return selected;
  }

  calculatePriority(history) {
    const now = new Date();
    let priority = 0;

    if (history.fsrsData?.due) {
      const dueDate = new Date(history.fsrsData.due);
      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        priority += Math.min(daysOverdue * 10, 100);
      }
    }

    const card = {
      stability: history.fsrsData?.stability || 0,
      state: fsrsService.stringToState(history.fsrsData?.state || "new"),
      lastReview: history.fsrsData?.lastReview || null
    };
    const retrievability = fsrsService.getRetrievability(card, now);
    priority += (1 - retrievability) * 50;

    if (history.totalAttempts > 0) {
      const errorRate = history.incorrectAttempts / history.totalAttempts;
      priority += errorRate * 50;
    }

    if (history.fsrsData?.lapses > 0) {
      priority += Math.min(history.fsrsData.lapses * 5, 30);
    }

    return Math.min(priority, 200);
  }

  async getDueForReviewQuestions(userId, examLevel, count, topicId, subjectId) {
    if (count <= 0) return [];

    const dueHistories = await UserQuestionHistory.find({
      userId,
      "fsrsData.due": { $lte: new Date() },
      masteryLevel: { $ne: "mastered" },
    })
      .sort({ "fsrsData.due": 1 })
      .limit(count * 2)
      .populate("questionId");

    const validHistories = dueHistories.filter((h) => {
      if (!h.questionId || !h.questionId.isActive) return false;
      if (topicId && h.questionId.topicId?.toString() !== topicId.toString()) return false;
      return true;
    });

    const questionsWithPriority = validHistories.map((h) => {
      const question = h.questionId;
      question.priority = this.calculatePriority(h);
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
      "fsrsData.scheduledDays": { $gte: 14 },
    })
      .sort({ "fsrsData.lastReview": 1 })
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

  async processAnswerWithFSRS(userId, questionId, isCorrect, responseTimeMs, question) {
    let history = await UserQuestionHistory.findOne({ userId, questionId });

    if (!history) {
      history = new UserQuestionHistory({
        userId,
        questionId,
        subject: question.subjectId || question.topicId,
        topic: question.topicId,
        fsrsData: {
          stability: 0,
          difficulty: 5,
          due: new Date(),
          elapsedDays: 0,
          scheduledDays: 0,
          reps: 0,
          lapses: 0,
          state: "new",
          lastReview: null
        },
      });
    }

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
    history.updateFSRS(isCorrect, responseTimeMs);

    const accuracy = history.correctAttempts / history.totalAttempts;
    history.updateMasteryLevel();

    history.weaknessScore = (1 - accuracy) * 100;
    history.isWeakArea = history.weaknessScore > 40 && history.totalAttempts >= 1;

    const totalTime = history.attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    history.averageResponseTime = totalTime / history.totalAttempts;

    await history.save();

    return {
      masteryLevel: history.masteryLevel,
      nextReviewDate: history.fsrsData.due,
      scheduledDays: history.fsrsData.scheduledDays,
      isWeakArea: history.isWeakArea,
      retrievability: history.getRetrievability()
    };
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
        averageStability: 0,
        totalLapses: 0
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

    const averageStability = histories.reduce((sum, h) => sum + (h.fsrsData?.stability || 0), 0) / histories.length;
    const totalLapses = histories.reduce((sum, h) => sum + (h.fsrsData?.lapses || 0), 0);

    return {
      recentAccuracy,
      averageTimePerQuestion: avgTime,
      streak: 0,
      totalQuestionsAttempted: histories.length,
      masteryDistribution,
      averageStability,
      totalLapses
    };
  }
}

export default new EnhancedQuestionSelectionService();
