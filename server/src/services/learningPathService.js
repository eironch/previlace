import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import UserProgress from "../models/UserProgress.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import fsrsService from "./fsrsService.js";
import dssService from "./dssService.js";

const LEARNING_PATH_TYPES = {
  WEAK_AREA_FOCUS: "weak_area_focus",
  SPACED_REVIEW: "spaced_review",
  NEW_CONTENT: "new_content",
  EXAM_PREP: "exam_prep",
  DAILY_PRACTICE: "daily_practice",
};

const learningPathService = {
  async generatePersonalizedPath(userId, options = {}) {
    const { examLevel = "Professional", daysAhead = 7 } = options;

    const [profile, fsrsStats, dssRecommendations, topicMastery] = await Promise.all([
      UserBehaviorProfile.findOne({ userId }),
      dssService.getFSRSStats(userId),
      dssService.generateRecommendations(userId),
      this.getTopicMasteryMap(userId),
    ]);

    const suggestedSessionLength = profile?.averageSessionDuration
      ? Math.min(60, Math.max(15, Math.round(profile.averageSessionDuration / 60000)))
      : 30;

    const dailyPlan = await this.buildDailyPlan(
      userId,
      daysAhead,
      {
        fsrsStats,
        dssRecommendations,
        topicMastery,
        profile,
        examLevel,
        sessionLength: suggestedSessionLength,
      }
    );

    const priorityTopics = await this.getPriorityTopics(userId, topicMastery, fsrsStats);

    return {
      dailyPlan,
      priorityTopics,
      sessionRecommendation: {
        length: suggestedSessionLength,
        optimalHours: profile?.peakStudyHours?.slice(0, 3) || [9, 14, 20],
        breakInterval: suggestedSessionLength > 30 ? 25 : null,
      },
      overallProgress: {
        masteredTopics: Object.values(topicMastery).filter((t) => t.mastery >= 90).length,
        inProgressTopics: Object.values(topicMastery).filter((t) => t.mastery >= 50 && t.mastery < 90).length,
        notStartedTopics: Object.values(topicMastery).filter((t) => t.mastery < 50).length,
        examReadiness: dssRecommendations?.risks?.examReadiness || { score: 0 },
      },
      behaviorInsights: {
        learningPace: profile?.learningPace || "moderate",
        focusPattern: profile?.peakStudyHours?.length > 0
          ? this.determineFocusPattern(profile.peakStudyHours)
          : "unknown",
        recommendedDifficulty: dssRecommendations?.learning?.difficultyAdjustment?.adjustment || "maintain",
      },
    };
  },

  async buildDailyPlan(userId, daysAhead, context) {
    const { fsrsStats, dssRecommendations, topicMastery, profile, examLevel, sessionLength } = context;

    const dailyPlan = [];
    const dueReviews = await this.getDueReviews(userId);
    const weakTopics = await this.getWeakTopics(userId, topicMastery);
    const newTopics = await this.getUnstartedTopics(userId, examLevel);

    for (let day = 0; day < daysAhead; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

      const isPreferredDay = profile?.preferredStudyDays?.includes(dayOfWeek) ?? true;

      const activities = [];
      let remainingTime = sessionLength;

      if (dueReviews.length > 0 && remainingTime > 0) {
        const reviewCount = Math.min(Math.floor(remainingTime / 2), 10, dueReviews.length);
        if (reviewCount > 0) {
          activities.push({
            type: LEARNING_PATH_TYPES.SPACED_REVIEW,
            priority: 1,
            duration: reviewCount * 2,
            questionCount: reviewCount,
            topics: dueReviews.slice(0, reviewCount).map((r) => r.topicId),
            description: `Review ${reviewCount} due items`,
          });
          remainingTime -= reviewCount * 2;
        }
      }

      if (weakTopics.length > 0 && remainingTime >= 10) {
        const weakTopic = weakTopics[day % weakTopics.length];
        activities.push({
          type: LEARNING_PATH_TYPES.WEAK_AREA_FOCUS,
          priority: 2,
          duration: Math.min(15, remainingTime),
          topicId: weakTopic.topicId,
          topicName: weakTopic.name,
          currentMastery: weakTopic.mastery,
          description: `Practice weak area: ${weakTopic.name}`,
        });
        remainingTime -= Math.min(15, remainingTime);
      }

      if (newTopics.length > 0 && remainingTime >= 10 && day % 2 === 0) {
        const newTopic = newTopics[Math.floor(day / 2) % newTopics.length];
        activities.push({
          type: LEARNING_PATH_TYPES.NEW_CONTENT,
          priority: 3,
          duration: Math.min(10, remainingTime),
          topicId: newTopic._id,
          topicName: newTopic.name,
          description: `Learn new topic: ${newTopic.name}`,
        });
        remainingTime -= Math.min(10, remainingTime);
      }

      if (activities.length === 0) {
        activities.push({
          type: LEARNING_PATH_TYPES.DAILY_PRACTICE,
          priority: 4,
          duration: sessionLength,
          description: "General practice quiz",
        });
      }

      dailyPlan.push({
        date: date.toISOString().split("T")[0],
        dayOfWeek,
        isPreferredDay,
        totalDuration: sessionLength - remainingTime,
        activities: activities.sort((a, b) => a.priority - b.priority),
      });
    }

    return dailyPlan;
  },

  async getTopicMasteryMap(userId) {
    const histories = await UserQuestionHistory.find({ userId })
      .populate("topicId", "name subjectId");

    const masteryMap = {};
    const now = new Date();

    histories.forEach((h) => {
      const topicId = h.topicId?._id?.toString();
      if (!topicId) return;

      if (!masteryMap[topicId]) {
        masteryMap[topicId] = {
          topicId,
          name: h.topicId.name,
          subjectId: h.topicId.subjectId,
          totalQuestions: 0,
          masteredQuestions: 0,
          averageRetention: 0,
          averageStability: 0,
        };
      }

      masteryMap[topicId].totalQuestions++;
      const retrievability = fsrsService.getRetrievability(h, now);

      if (retrievability > 0.9 && (h.stability || 0) > 21) {
        masteryMap[topicId].masteredQuestions++;
      }

      masteryMap[topicId].averageRetention += retrievability;
      masteryMap[topicId].averageStability += h.stability || 0;
    });

    Object.values(masteryMap).forEach((topic) => {
      if (topic.totalQuestions > 0) {
        topic.mastery = Math.round(
          (topic.masteredQuestions / topic.totalQuestions) * 100
        );
        topic.averageRetention = Math.round(
          (topic.averageRetention / topic.totalQuestions) * 100
        );
        topic.averageStability = Math.round(
          topic.averageStability / topic.totalQuestions
        );
      } else {
        topic.mastery = 0;
      }
    });

    return masteryMap;
  },

  async getDueReviews(userId) {
    const now = new Date();
    const histories = await UserQuestionHistory.find({
      userId,
      nextReviewDate: { $lte: now },
    })
      .populate("topicId", "name")
      .sort({ nextReviewDate: 1 })
      .limit(50);

    return histories.map((h) => ({
      historyId: h._id,
      questionId: h.questionId,
      topicId: h.topicId?._id,
      topicName: h.topicId?.name,
      dueDate: h.nextReviewDate,
      retrievability: fsrsService.getRetrievability(h, now),
    }));
  },

  async getWeakTopics(userId, topicMastery) {
    const weakTopics = Object.values(topicMastery)
      .filter((t) => t.mastery < 60 && t.totalQuestions >= 3)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 5);

    return weakTopics;
  },

  async getUnstartedTopics(userId, examLevel) {
    const startedTopicIds = await UserQuestionHistory.distinct("topicId", { userId });

    const query = { isActive: true, _id: { $nin: startedTopicIds } };

    const topics = await Topic.find(query)
      .populate("subjectId", "name")
      .limit(10);

    return topics;
  },

  async getPriorityTopics(userId, topicMastery, fsrsStats) {
    const now = new Date();
    const histories = await UserQuestionHistory.find({ userId })
      .populate("topicId", "name subjectId");

    const topicPriority = {};

    histories.forEach((h) => {
      const topicId = h.topicId?._id?.toString();
      if (!topicId) return;

      if (!topicPriority[topicId]) {
        topicPriority[topicId] = {
          topicId,
          name: h.topicId.name,
          dueCount: 0,
          lowRetentionCount: 0,
          priorityScore: 0,
        };
      }

      const retrievability = fsrsService.getRetrievability(h, now);

      if (h.nextReviewDate && new Date(h.nextReviewDate) <= now) {
        topicPriority[topicId].dueCount++;
      }

      if (retrievability < 0.7) {
        topicPriority[topicId].lowRetentionCount++;
      }
    });

    Object.values(topicPriority).forEach((t) => {
      const mastery = topicMastery[t.topicId]?.mastery || 0;
      t.priorityScore = t.dueCount * 3 + t.lowRetentionCount * 2 + (100 - mastery) * 0.5;
    });

    return Object.values(topicPriority)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10);
  },

  determineFocusPattern(peakHours) {
    if (!peakHours || peakHours.length === 0) return "unknown";

    const avgHour = peakHours.reduce((a, b) => a + b, 0) / peakHours.length;

    if (avgHour < 12) return "morning";
    if (avgHour < 17) return "afternoon";
    return "evening";
  },

  async getAdaptedQuizConfig(userId, baseConfig) {
    const profile = await UserBehaviorProfile.findOne({ userId });
    const dssRecommendations = await dssService.generateRecommendations(userId);

    if (!profile) {
      return baseConfig;
    }

    const adjustments = {};

    const diffAdj = dssRecommendations?.learning?.difficultyAdjustment?.adjustment;
    if (diffAdj === "increase") {
      adjustments.difficultyBias = "advanced";
    } else if (diffAdj === "decrease") {
      adjustments.difficultyBias = "beginner";
    }

    if (profile.averageFocusScore < 70) {
      adjustments.questionCount = Math.min(baseConfig.questionCount || 10, 10);
    }

    if (profile.averageConfidenceScore < 60) {
      adjustments.showHints = true;
    }

    if (profile.autoInterventions?.difficultyReduction) {
      adjustments.difficultyBias = "beginner";
      adjustments.reviewMode = true;
    }

    return {
      ...baseConfig,
      ...adjustments,
      behaviorProfile: {
        focusScore: profile.averageFocusScore,
        confidenceScore: profile.averageConfidenceScore,
        learningPace: profile.learningPace,
      },
    };
  },

  async getStudyStreak(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await UserQuestionHistory.find({
      userId,
      lastReviewedAt: { $gte: thirtyDaysAgo },
    }).select("lastReviewedAt");

    const studyDays = new Set();
    sessions.forEach((s) => {
      if (s.lastReviewedAt) {
        studyDays.add(s.lastReviewedAt.toISOString().split("T")[0]);
      }
    });

    let currentStreak = 0;
    let maxStreak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (studyDays.has(dateStr)) {
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
      } else if (i > 0) {
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
        if (i <= 1) {
          currentStreak = 0;
        }
        break;
      }
    }

    return {
      currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      totalStudyDays: studyDays.size,
    };
  },

  async getWeeklyGoalProgress(userId) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const sessions = await UserQuestionHistory.countDocuments({
      userId,
      lastReviewedAt: { $gte: weekStart },
    });

    const weeklyGoal = 100;

    return {
      current: sessions,
      goal: weeklyGoal,
      percentage: Math.min(100, Math.round((sessions / weeklyGoal) * 100)),
      remaining: Math.max(0, weeklyGoal - sessions),
    };
  },
};

export default learningPathService;
