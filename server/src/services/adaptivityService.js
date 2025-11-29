import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import QuizSessionBehavior from "../models/QuizSessionBehavior.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import dssService from "./dssService.js";
import questionPriorityService from "./questionPriorityService.js";
import fsrsService from "./fsrsService.js";

const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

const SESSION_LENGTH_THRESHOLDS = {
  low_focus: { maxQuestions: 10, maxMinutes: 15 },
  moderate_focus: { maxQuestions: 15, maxMinutes: 25 },
  high_focus: { maxQuestions: 25, maxMinutes: 45 },
};

const adaptivityService = {
  async getAdaptedQuizConfig(userId, baseConfig = {}) {
    const {
      questionCount = 20,
      examLevel = "Professional",
      topicIds = [],
      mode = "practice",
    } = baseConfig;

    const [profile, dssRecommendations, reviewSummary] = await Promise.all([
      UserBehaviorProfile.findOne({ userId }),
      dssService.generateRecommendations(userId).catch(() => null),
      questionPriorityService.getReviewSummary(userId).catch(() => null),
    ]);

    const adaptations = {
      questionCount,
      difficultyBias: null,
      timeLimit: null,
      showHints: false,
      breakSuggestionInterval: null,
      questionPriority: "balanced",
      feedbackLevel: "standard",
    };

    if (profile) {
      adaptations.questionCount = this.adaptQuestionCount(
        questionCount,
        profile.averageFocusScore,
        profile.averageEngagementScore
      );

      adaptations.difficultyBias = this.calculateDifficultyBias(
        profile,
        dssRecommendations
      );

      adaptations.timeLimit = this.calculateTimeLimit(
        adaptations.questionCount,
        profile.averageQuestionTime
      );

      if (profile.averageFocusScore < 70) {
        adaptations.breakSuggestionInterval = 10;
      } else if (profile.averageFocusScore < 85) {
        adaptations.breakSuggestionInterval = 20;
      }

      if (profile.averageConfidenceScore < 60) {
        adaptations.showHints = true;
        adaptations.feedbackLevel = "detailed";
      }

      if (profile.autoInterventions?.difficultyReduction) {
        adaptations.difficultyBias = "beginner";
        adaptations.feedbackLevel = "detailed";
      }
    }

    if (reviewSummary && reviewSummary.dueCount > 10) {
      adaptations.questionPriority = "due_first";
    } else if (reviewSummary && reviewSummary.lowRetentionCount > 5) {
      adaptations.questionPriority = "retention_focus";
    }

    const prioritizedQuestions = topicIds.length > 0
      ? await questionPriorityService.getQuestionPriorityQueue(
          userId,
          topicIds,
          adaptations.questionCount * 2,
          { examLevel }
        )
      : null;

    return {
      config: {
        ...baseConfig,
        ...adaptations,
      },
      behaviorProfile: profile ? {
        focusScore: profile.averageFocusScore,
        confidenceScore: profile.averageConfidenceScore,
        integrityScore: profile.averageIntegrityScore,
        engagementScore: profile.averageEngagementScore,
        learningPace: profile.learningPace,
      } : null,
      dssInsights: dssRecommendations ? {
        examReadiness: dssRecommendations.risks?.examReadiness,
        strengths: dssRecommendations.insights?.strengths?.slice(0, 3),
        weaknesses: dssRecommendations.insights?.weaknesses?.slice(0, 3),
        difficultyRecommendation: dssRecommendations.learning?.difficultyAdjustment,
      } : null,
      reviewSummary,
      prioritizedQuestionIds: prioritizedQuestions?.questions?.map((q) => q._id) || null,
      adaptationsApplied: Object.entries(adaptations)
        .filter(([key, value]) => value !== null && value !== baseConfig[key])
        .map(([key, value]) => ({ key, value })),
    };
  },

  adaptQuestionCount(base, focusScore, engagementScore) {
    const avgScore = ((focusScore || 80) + (engagementScore || 80)) / 2;

    if (avgScore < 50) {
      return Math.min(base, SESSION_LENGTH_THRESHOLDS.low_focus.maxQuestions);
    }
    if (avgScore < 75) {
      return Math.min(base, SESSION_LENGTH_THRESHOLDS.moderate_focus.maxQuestions);
    }
    return Math.min(base, SESSION_LENGTH_THRESHOLDS.high_focus.maxQuestions);
  },

  calculateDifficultyBias(profile, dssRecommendations) {
    const dssAdjustment = dssRecommendations?.learning?.difficultyAdjustment?.adjustment;

    if (dssAdjustment === "decrease") return "beginner";
    if (dssAdjustment === "increase") return "advanced";

    const confidence = profile.averageConfidenceScore || 80;
    const integrity = profile.averageIntegrityScore || 100;

    if (confidence < 60 || integrity < 70) return "beginner";
    if (confidence > 85 && integrity > 85) return "advanced";

    return "intermediate";
  },

  calculateTimeLimit(questionCount, avgQuestionTime) {
    const baseTime = avgQuestionTime || 45000;
    const bufferMultiplier = 1.5;
    const totalMs = questionCount * baseTime * bufferMultiplier;
    return Math.ceil(totalMs / 60000);
  },

  async calculateMidQuizAdjustments(quizAttemptId, currentBehavior) {
    const sessionBehavior = await QuizSessionBehavior.findOne({ quizAttemptId });
    if (!sessionBehavior) {
      return { adjustments: [], suggestions: [] };
    }

    const adjustments = [];
    const suggestions = [];

    const {
      questionsAnswered = 0,
      correctAnswers = 0,
      recentIntegrityEvents = [],
      currentFocusScore = 100,
      totalTimeSpent = 0,
    } = currentBehavior;

    const accuracy = questionsAnswered > 0 ? correctAnswers / questionsAnswered : 1;

    if (questionsAnswered >= 5 && accuracy < 0.4) {
      adjustments.push({
        type: "difficulty_reduction",
        reason: "low_accuracy",
        currentAccuracy: accuracy,
      });
      suggestions.push({
        type: "encouragement",
        message: "Take your time with each question. Review the material if needed.",
      });
    }

    if (currentFocusScore < 60) {
      suggestions.push({
        type: "break_suggestion",
        message: "Consider taking a short break to refocus.",
        priority: "medium",
      });
    }

    const recentTabSwitches = recentIntegrityEvents.filter(
      (e) => e.type === "tab_switch"
    ).length;
    if (recentTabSwitches > 3) {
      suggestions.push({
        type: "focus_reminder",
        message: "Try to stay focused on the quiz for better results.",
        priority: "low",
      });
    }

    const avgTimePerQuestion = questionsAnswered > 0 ? totalTimeSpent / questionsAnswered : 0;
    if (avgTimePerQuestion > 120000) {
      suggestions.push({
        type: "pacing",
        message: "You're spending a lot of time per question. Trust your instincts.",
        priority: "low",
      });
    }

    return {
      adjustments,
      suggestions,
      metrics: {
        accuracy,
        avgTimePerQuestion: Math.round(avgTimePerQuestion / 1000),
        focusScore: currentFocusScore,
        integrityEventCount: recentIntegrityEvents.length,
      },
    };
  },

  async getSessionRecommendations(userId) {
    const [profile, dssRecommendations] = await Promise.all([
      UserBehaviorProfile.findOne({ userId }),
      dssService.generateRecommendations(userId).catch(() => null),
    ]);

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });

    const isPeakHour = profile?.peakStudyHours?.includes(currentHour);
    const isPreferredDay = profile?.preferredStudyDays?.includes(currentDay);

    let sessionLength = 30;
    if (profile?.averageFocusScore) {
      if (profile.averageFocusScore >= 85) sessionLength = 45;
      else if (profile.averageFocusScore >= 70) sessionLength = 30;
      else sessionLength = 20;
    }

    const recommendations = {
      optimalSessionLength: sessionLength,
      isPeakStudyTime: isPeakHour,
      isPreferredStudyDay: isPreferredDay,
      suggestedActivities: [],
      focusTips: [],
    };

    const reviewSummary = await questionPriorityService.getReviewSummary(userId);
    if (reviewSummary?.dueCount > 0) {
      recommendations.suggestedActivities.push({
        type: "spaced_review",
        priority: "high",
        description: `${reviewSummary.dueCount} items due for review`,
        estimatedTime: Math.min(reviewSummary.dueCount * 2, 20),
      });
    }

    if (dssRecommendations?.risks?.atRiskTopics?.length > 0) {
      const topWeakTopic = dssRecommendations.risks.atRiskTopics[0];
      recommendations.suggestedActivities.push({
        type: "weak_area_practice",
        priority: "medium",
        description: `Practice ${topWeakTopic.name}`,
        topicId: topWeakTopic.topicId,
        estimatedTime: 15,
      });
    }

    if (isPeakHour) {
      recommendations.suggestedActivities.push({
        type: "new_content",
        priority: "medium",
        description: "Good time to learn new material",
        estimatedTime: 20,
      });
    }

    if (profile?.averageFocusScore < 75) {
      recommendations.focusTips.push("Try a quieter study environment");
      recommendations.focusTips.push("Use the Pomodoro technique: 25 min focus, 5 min break");
    }

    if (profile?.typicalAnswerChangeRate > 2) {
      recommendations.focusTips.push("Read questions carefully before answering");
    }

    return recommendations;
  },

  async getExamDayRecommendations(userId, examDate) {
    const now = new Date();
    const daysUntilExam = Math.ceil((new Date(examDate) - now) / (1000 * 60 * 60 * 24));

    const [profile, fsrsStats, reviewSummary] = await Promise.all([
      UserBehaviorProfile.findOne({ userId }),
      dssService.getFSRSStats(userId),
      questionPriorityService.getReviewSummary(userId),
    ]);

    const recommendations = {
      daysUntilExam,
      readinessScore: 0,
      urgentActions: [],
      dailyTargets: {},
      confidenceAreas: [],
      concernAreas: [],
    };

    if (fsrsStats) {
      recommendations.readinessScore = Math.round(fsrsStats.avgRetention);
    }

    if (daysUntilExam <= 7) {
      recommendations.urgentActions.push({
        action: "Focus on review, not new content",
        priority: "high",
      });

      if (reviewSummary?.dueCount > 20) {
        recommendations.urgentActions.push({
          action: `Clear ${reviewSummary.dueCount} overdue reviews`,
          priority: "critical",
        });
      }
    }

    if (daysUntilExam > 0 && reviewSummary) {
      const dailyReviewTarget = Math.ceil(reviewSummary.dueCount / daysUntilExam);
      recommendations.dailyTargets = {
        reviews: Math.max(dailyReviewTarget, 10),
        newQuestions: daysUntilExam > 7 ? 10 : 0,
        practiceTime: daysUntilExam > 14 ? 60 : daysUntilExam > 7 ? 45 : 30,
      };
    }

    if (fsrsStats?.avgRetention > 85) {
      recommendations.confidenceAreas.push("Strong overall retention");
    }

    if (fsrsStats?.avgRetention < 70) {
      recommendations.concernAreas.push("Retention below target - increase review frequency");
    }

    if (profile?.averageIntegrityScore < 80) {
      recommendations.concernAreas.push("Practice in exam-like conditions to improve focus");
    }

    return recommendations;
  },

  async recordBehaviorFeedback(userId, quizAttemptId, feedbackData) {
    const { difficultyFeeling, paceFeeling, focusRating } = feedbackData;

    const profile = await UserBehaviorProfile.findOne({ userId });
    if (!profile) return null;

    if (!profile.userFeedback) {
      profile.userFeedback = [];
    }

    profile.userFeedback.push({
      quizAttemptId,
      difficultyFeeling,
      paceFeeling,
      focusRating,
      recordedAt: new Date(),
    });

    if (profile.userFeedback.length > 50) {
      profile.userFeedback = profile.userFeedback.slice(-50);
    }

    await profile.save();

    return { recorded: true };
  },
};

export default adaptivityService;
