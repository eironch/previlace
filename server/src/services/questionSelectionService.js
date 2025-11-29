import ManualQuestion from "../models/ManualQuestion.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import fsrsService from "./fsrsService.js";

class QuestionSelectionService {
  async selectQuestionsForSession(userId, config) {
    const {
      categories = [],
      difficulty = "",
      examLevel = "",
      questionCount = 10,
      mode = "practice"
    } = config;

    const query = this.buildBaseQuery(categories, difficulty, examLevel);

    if (mode === "spaced-repetition") {
      return this.selectSpacedRepetitionQuestions(userId, query, questionCount);
    }

    if (mode === "adaptive") {
      return this.selectAdaptiveQuestions(userId, query, questionCount);
    }

    return this.selectRandomQuestions(userId, query, questionCount);
  }

  buildBaseQuery(categories, difficulty, examLevel) {
    const query = {
      status: "published",
      isActive: true
    };

    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (examLevel) {
      query.examLevel = examLevel;
    }

    return query;
  }

  async selectRandomQuestions(userId, query, questionCount) {
    const reviewCount = Math.floor(questionCount * 0.3);
    const newCount = questionCount - reviewCount;

    const reviewQuestions = await this.selectSpacedRepetitionQuestions(userId, query, reviewCount);
    const reviewIds = reviewQuestions.map(q => q._id);

    const recentQuestions = await this.getRecentlyAnsweredQuestions(userId, 50);
    const excludeIds = [...recentQuestions, ...reviewIds];

    if (excludeIds.length > 0) {
      query._id = { $nin: excludeIds };
    }

    const newQuestions = await ManualQuestion.aggregate([
      { $match: query },
      { $sample: { size: newCount * 2 } }
    ]);

    const selectedNew = newQuestions.slice(0, newCount);
    const combined = [...reviewQuestions, ...selectedNew];
    return combined.sort(() => Math.random() - 0.5);
  }

  async selectSpacedRepetitionQuestions(userId, query, questionCount) {
    const dueHistories = await UserQuestionHistory.find({
      userId,
      "fsrsData.due": { $lte: new Date() },
      masteryLevel: { $ne: "mastered" }
    })
      .sort({ "fsrsData.due": 1 })
      .limit(questionCount)
      .populate("questionId");

    const dueQuestions = dueHistories
      .filter(h => h.questionId)
      .map(h => h.questionId);

    if (dueQuestions.length < questionCount) {
      const additionalCount = questionCount - dueQuestions.length;
      const dueQuestionIds = dueQuestions.map(q => q._id);

      const additionalQuery = { ...query };
      if (dueQuestionIds.length > 0) {
        additionalQuery._id = { $nin: dueQuestionIds };
      }

      const additionalQuestions = await ManualQuestion.aggregate([
        { $match: additionalQuery },
        { $sample: { size: additionalCount } }
      ]);

      return [...dueQuestions, ...additionalQuestions];
    }

    return dueQuestions;
  }

  async selectByRetrievability(userId, threshold = 0.85, questionCount = 20) {
    const lowRetrievability = await UserQuestionHistory.getByRetrievability(
      userId,
      threshold,
      questionCount
    );

    return lowRetrievability
      .filter(h => h.questionId)
      .map(h => h.questionId);
  }

  async selectAdaptiveQuestions(userId, query, questionCount) {
    const userPerformance = await this.getUserPerformanceLevel(userId);

    const difficultyDistribution = this.calculateDifficultyDistribution(
      userPerformance,
      questionCount
    );

    const questions = [];

    for (const [difficulty, count] of Object.entries(difficultyDistribution)) {
      const difficultyQuery = { ...query, difficulty };
      const difficultyQuestions = await this.selectRandomQuestions(
        userId,
        difficultyQuery,
        count
      );
      questions.push(...difficultyQuestions);
    }

    return questions.slice(0, questionCount);
  }

  async getUserPerformanceLevel(userId) {
    const recentHistory = await UserQuestionHistory.aggregate([
      { $match: { userId } },
      { $sort: { lastAttemptAt: -1 } },
      { $limit: 20 },
      {
        $group: {
          _id: null,
          averageAccuracy: {
            $avg: {
              $cond: [
                { $gt: ["$totalAttempts", 0] },
                { $divide: ["$correctAttempts", "$totalAttempts"] },
                0
              ]
            }
          }
        }
      }
    ]);

    return recentHistory[0]?.averageAccuracy || 0.5;
  }

  calculateDifficultyDistribution(performanceLevel, questionCount) {
    if (performanceLevel >= 0.8) {
      return {
        beginner: Math.floor(questionCount * 0.1),
        intermediate: Math.floor(questionCount * 0.3),
        advanced: Math.floor(questionCount * 0.6)
      };
    } else if (performanceLevel >= 0.6) {
      return {
        beginner: Math.floor(questionCount * 0.2),
        intermediate: Math.floor(questionCount * 0.6),
        advanced: Math.floor(questionCount * 0.2)
      };
    } else {
      return {
        beginner: Math.floor(questionCount * 0.6),
        intermediate: Math.floor(questionCount * 0.3),
        advanced: Math.floor(questionCount * 0.1)
      };
    }
  }

  async getRecentlyAnsweredQuestions(userId, limit = 20) {
    const recentHistory = await UserQuestionHistory.find({ userId })
      .sort({ lastAttemptAt: -1 })
      .limit(limit)
      .select("questionId");

    return recentHistory.map(h => h.questionId);
  }

  async prioritizeWeakAreas(userId, questions) {
    const weakAreas = await this.identifyWeakAreas(userId);

    if (weakAreas.length === 0) return questions;

    const weakAreaQuestions = questions.filter(q =>
      weakAreas.includes(q.category) || weakAreas.includes(q.subjectArea)
    );

    const otherQuestions = questions.filter(q =>
      !weakAreas.includes(q.category) && !weakAreas.includes(q.subjectArea)
    );

    const prioritizedCount = Math.floor(questions.length * 0.7);
    return [
      ...weakAreaQuestions.slice(0, prioritizedCount),
      ...otherQuestions.slice(0, questions.length - prioritizedCount)
    ];
  }

  async identifyWeakAreas(userId) {
    const categoryPerformance = await UserQuestionHistory.aggregate([
      { $match: { userId, totalAttempts: { $gt: 2 } } },
      {
        $lookup: {
          from: "manualquestions",
          localField: "questionId",
          foreignField: "_id",
          as: "question"
        }
      },
      { $unwind: "$question" },
      {
        $group: {
          _id: "$question.category",
          accuracy: {
            $avg: {
              $divide: ["$correctAttempts", "$totalAttempts"]
            }
          }
        }
      },
      { $match: { accuracy: { $lt: 0.5 } } },
      { $sort: { accuracy: 1 } }
    ]);

    return categoryPerformance.map(cp => cp._id);
  }

  async prioritizeByRetrievability(userId, questions) {
    const questionIds = questions.map(q => q._id);

    const histories = await UserQuestionHistory.find({
      userId,
      questionId: { $in: questionIds }
    });

    const historyMap = new Map();
    const now = new Date();

    for (const h of histories) {
      const card = {
        stability: h.fsrsData?.stability || 0,
        state: fsrsService.stringToState(h.fsrsData?.state || "new"),
        lastReview: h.fsrsData?.lastReview || null
      };
      const retrievability = fsrsService.getRetrievability(card, now);
      historyMap.set(h.questionId.toString(), retrievability);
    }

    return [...questions].sort((a, b) => {
      const retA = historyMap.get(a._id.toString()) ?? 1;
      const retB = historyMap.get(b._id.toString()) ?? 1;
      return retA - retB;
    });
  }
}

export default new QuestionSelectionService();
