import UserQuestionHistory from "../models/UserQuestionHistory.js";
import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import ManualQuestion from "../models/ManualQuestion.js";
import fsrsService from "./fsrsService.js";

const PRIORITY_WEIGHTS = {
  DUE_REVIEW: 100,
  LOW_RETENTION: 80,
  HIGH_DIFFICULTY: 60,
  WEAK_TOPIC: 50,
  NEW_CONTENT: 30,
  MASTERED: 10,
};

const questionPriorityService = {
  async getQuestionPriorityQueue(userId, topicIds, count, options = {}) {
    const { examLevel = null, excludeRecent = true, recentDays = 7 } = options;

    const now = new Date();
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - recentDays);

    const histories = await UserQuestionHistory.find({
      userId,
      topicId: { $in: topicIds },
    }).populate("questionId");

    const behaviorProfile = await UserBehaviorProfile.findOne({ userId });

    const dueQuestions = [];
    const lowRetentionQuestions = [];
    const reviewedQuestionIds = new Set();

    for (const history of histories) {
      if (!history.questionId) continue;

      reviewedQuestionIds.add(history.questionId._id.toString());

      const retrievability = fsrsService.getRetrievability(history, now);
      const isDue = history.nextReviewDate && new Date(history.nextReviewDate) <= now;

      if (isDue) {
        dueQuestions.push({
          question: history.questionId,
          historyId: history._id,
          priority: PRIORITY_WEIGHTS.DUE_REVIEW + (1 - retrievability) * 20,
          retrievability,
          reason: "due_review",
        });
      } else if (retrievability < 0.7) {
        lowRetentionQuestions.push({
          question: history.questionId,
          historyId: history._id,
          priority: PRIORITY_WEIGHTS.LOW_RETENTION + (0.7 - retrievability) * 50,
          retrievability,
          reason: "low_retention",
        });
      }
    }

    const newQuestionQuery = {
      topicId: { $in: topicIds },
      status: "published",
      isActive: true,
      _id: { $nin: Array.from(reviewedQuestionIds) },
    };

    if (examLevel) {
      const normalizedLevel = examLevel.replace(/-/g, "").toLowerCase();
      newQuestionQuery.$or = [
        { examLevel: { $regex: new RegExp(`^${examLevel}$`, "i") } },
        { examLevel: { $regex: new RegExp(`^${normalizedLevel}$`, "i") } },
        { examLevel: "Both" },
      ];
    }

    const newQuestions = await ManualQuestion.find(newQuestionQuery).limit(count * 2);

    const newWithPriority = newQuestions.map((q) => ({
      question: q,
      historyId: null,
      priority: PRIORITY_WEIGHTS.NEW_CONTENT + Math.random() * 10,
      retrievability: null,
      reason: "new_content",
    }));

    let allQuestions = [...dueQuestions, ...lowRetentionQuestions, ...newWithPriority];

    if (behaviorProfile) {
      allQuestions = this.applyBehaviorAdjustments(allQuestions, behaviorProfile);
    }

    allQuestions.sort((a, b) => b.priority - a.priority);

    const selectedQuestions = [];
    const selectedIds = new Set();
    const difficultyDistribution = { beginner: 0, intermediate: 0, advanced: 0 };

    for (const item of allQuestions) {
      if (selectedQuestions.length >= count) break;

      const qId = item.question._id.toString();
      if (selectedIds.has(qId)) continue;

      if (excludeRecent && item.historyId) {
        const history = histories.find((h) => h._id.equals(item.historyId));
        if (history?.lastReviewedAt && new Date(history.lastReviewedAt) > recentCutoff) {
          if (item.reason !== "due_review") continue;
        }
      }

      const difficulty = (item.question.difficulty || "intermediate").toLowerCase();
      difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;

      selectedIds.add(qId);
      selectedQuestions.push(item);
    }

    return {
      questions: selectedQuestions.map((item) => ({
        ...item.question.toObject(),
        _priorityMeta: {
          priority: item.priority,
          reason: item.reason,
          retrievability: item.retrievability,
        },
      })),
      meta: {
        totalDue: dueQuestions.length,
        totalLowRetention: lowRetentionQuestions.length,
        totalNew: newWithPriority.length,
        difficultyDistribution,
        behaviorAdjusted: !!behaviorProfile,
      },
    };
  },

  applyBehaviorAdjustments(questions, profile) {
    const confidenceScore = profile.averageConfidenceScore || 80;
    const focusScore = profile.averageFocusScore || 80;

    return questions.map((item) => {
      let adjustment = 0;
      const difficulty = (item.question.difficulty || "intermediate").toLowerCase();

      if (confidenceScore < 60) {
        if (difficulty === "advanced") adjustment -= 20;
        if (difficulty === "beginner") adjustment += 10;
      } else if (confidenceScore > 85) {
        if (difficulty === "advanced") adjustment += 15;
        if (difficulty === "beginner") adjustment -= 10;
      }

      if (focusScore < 70) {
        if (item.reason === "new_content") adjustment -= 15;
        if (item.reason === "due_review") adjustment += 10;
      }

      return {
        ...item,
        priority: item.priority + adjustment,
      };
    });
  },

  async getDueReviewCount(userId) {
    const now = new Date();
    return UserQuestionHistory.countDocuments({
      userId,
      nextReviewDate: { $lte: now },
    });
  },

  async getLowRetentionCount(userId, threshold = 0.7) {
    const histories = await UserQuestionHistory.find({ userId });
    const now = new Date();

    let count = 0;
    for (const history of histories) {
      const retrievability = fsrsService.getRetrievability(history, now);
      if (retrievability < threshold) count++;
    }
    return count;
  },

  async getReviewSummary(userId) {
    const now = new Date();
    const histories = await UserQuestionHistory.find({ userId });

    let dueCount = 0;
    let lowRetentionCount = 0;
    let masteredCount = 0;
    let learningCount = 0;

    for (const history of histories) {
      const retrievability = fsrsService.getRetrievability(history, now);
      const isDue = history.nextReviewDate && new Date(history.nextReviewDate) <= now;

      if (isDue) {
        dueCount++;
      }

      if (retrievability < 0.7) {
        lowRetentionCount++;
      } else if (retrievability > 0.9 && (history.stability || 0) > 21) {
        masteredCount++;
      } else {
        learningCount++;
      }
    }

    return {
      total: histories.length,
      dueCount,
      lowRetentionCount,
      masteredCount,
      learningCount,
      reviewNeeded: dueCount + lowRetentionCount,
    };
  },

  calculateOptimalReviewOrder(questions, userProfile) {
    const now = new Date();
    const currentHour = now.getHours();
    const isPeakHour = userProfile?.peakStudyHours?.includes(currentHour);

    return questions.sort((a, b) => {
      const metaA = a._priorityMeta || {};
      const metaB = b._priorityMeta || {};

      if (isPeakHour) {
        if (metaA.reason === "new_content" && metaB.reason !== "new_content") return -1;
        if (metaB.reason === "new_content" && metaA.reason !== "new_content") return 1;
      }

      return (metaB.priority || 0) - (metaA.priority || 0);
    });
  },
};

export default questionPriorityService;
