import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import QuizSessionBehavior from "../models/QuizSessionBehavior.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import UserProgress from "../models/UserProgress.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import fsrsService from "./fsrsService.js";

const dssService = {
  async generateRecommendations(userId) {
    const [behaviorProfile, fsrsStats, recentQuizzes, integrityEvents] = await Promise.all([
      UserBehaviorProfile.findOne({ userId }),
      this.getFSRSStats(userId),
      this.getRecentQuizzes(userId, 10),
      this.getRecentIntegrityEvents(userId),
    ]);

    const learning = {
      nextTopics: await this.recommendNextTopics(userId, fsrsStats),
      optimalStudyTime: this.calculateOptimalStudyTime(behaviorProfile),
      suggestedSessionLength: this.suggestSessionLength(behaviorProfile),
      difficultyAdjustment: this.calculateDifficultyAdjustment(recentQuizzes, behaviorProfile),
      studySchedule: this.generateStudySchedule(behaviorProfile),
    };

    const insights = {
      strengths: this.identifyStrengths(fsrsStats, behaviorProfile),
      weaknesses: this.identifyWeaknesses(fsrsStats, behaviorProfile),
      improvementAreas: this.suggestImprovements(recentQuizzes, behaviorProfile),
    };

    const risks = {
      examReadiness: await this.calculateExamReadiness(userId),
      atRiskTopics: await this.identifyAtRiskTopics(userId, fsrsStats),
      interventionNeeded: this.checkInterventionNeeded(behaviorProfile, integrityEvents),
    };

    const behavior = {
      integrityScore: this.calculateOverallIntegrity(integrityEvents, behaviorProfile),
      engagementTrend: this.calculateEngagementTrend(behaviorProfile),
      focusPattern: this.analyzeFocusPattern(behaviorProfile),
      learningVelocity: await this.calculateLearningVelocity(userId),
    };

    return { learning, insights, risks, behavior };
  },

  async getFSRSStats(userId) {
    const histories = await UserQuestionHistory.find({ userId })
      .select("stability difficulty state lastReviewedAt nextReviewDate retrievability topicId");

    if (!histories.length) {
      return { totalCards: 0, dueCards: 0, avgRetention: 0, avgStability: 0, avgDifficulty: 5, masteredCount: 0 };
    }

    const now = new Date();
    let totalRetention = 0;
    let totalStability = 0;
    let totalDifficulty = 0;
    let dueCount = 0;
    let masteredCount = 0;

    histories.forEach((h) => {
      const retrievability = fsrsService.getRetrievability(h, now);
      totalRetention += retrievability;
      totalStability += h.stability || 0;
      totalDifficulty += h.difficulty || 5;

      if (h.nextReviewDate && new Date(h.nextReviewDate) <= now) {
        dueCount++;
      }

      if (h.stability > 21 && retrievability > 0.9) {
        masteredCount++;
      }
    });

    return {
      totalCards: histories.length,
      dueCards: dueCount,
      avgRetention: (totalRetention / histories.length) * 100,
      avgStability: totalStability / histories.length,
      avgDifficulty: totalDifficulty / histories.length,
      masteredCount,
    };
  },

  async getRecentQuizzes(userId, limit) {
    return QuizSessionBehavior.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("quizAttemptId", "score totalQuestions");
  },

  async getRecentIntegrityEvents(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await QuizSessionBehavior.find({
      userId,
      createdAt: { $gte: startDate },
    }).select("integrityEvents integrityScore focusScore");

    const allEvents = [];
    sessions.forEach((s) => {
      if (s.integrityEvents) {
        allEvents.push(...s.integrityEvents);
      }
    });

    return allEvents;
  },

  async recommendNextTopics(userId, fsrsStats) {
    const histories = await UserQuestionHistory.find({ userId })
      .populate("topicId", "name subjectId");

    const topicStats = {};
    const now = new Date();

    histories.forEach((h) => {
      const topicId = h.topicId?._id?.toString();
      if (!topicId) return;

      if (!topicStats[topicId]) {
        topicStats[topicId] = {
          topicId,
          name: h.topicId.name,
          subjectId: h.topicId.subjectId,
          dueCount: 0,
          lowRetentionCount: 0,
          totalQuestions: 0,
          avgRetention: 0,
        };
      }

      topicStats[topicId].totalQuestions++;

      const retrievability = fsrsService.getRetrievability(h, now);
      topicStats[topicId].avgRetention += retrievability;

      if (h.nextReviewDate && new Date(h.nextReviewDate) <= now) {
        topicStats[topicId].dueCount++;
      }

      if (retrievability < 0.7) {
        topicStats[topicId].lowRetentionCount++;
      }
    });

    Object.values(topicStats).forEach((t) => {
      t.avgRetention = (t.avgRetention / t.totalQuestions) * 100;
      t.priority = t.dueCount * 2 + t.lowRetentionCount * 1.5 + (100 - t.avgRetention) * 0.5;
    });

    const sorted = Object.values(topicStats).sort((a, b) => b.priority - a.priority);
    return sorted.slice(0, 5);
  },

  calculateOptimalStudyTime(profile) {
    if (!profile?.peakStudyHours?.length) {
      return { hours: [9, 10, 14, 15, 20], recommendation: "Morning or early evening sessions recommended" };
    }

    const hours = profile.peakStudyHours.slice(0, 3);
    let recommendation;

    const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
    if (avgHour < 12) {
      recommendation = "You perform best in morning sessions";
    } else if (avgHour < 17) {
      recommendation = "Afternoon study sessions work well for you";
    } else {
      recommendation = "Evening sessions suit your learning pattern";
    }

    return { hours, recommendation };
  },

  suggestSessionLength(profile) {
    if (!profile) return { minutes: 30, recommendation: "Start with 30-minute focused sessions" };

    const avgDuration = profile.averageSessionDuration / 60000;
    const focusScore = profile.averageFocusScore || 80;

    let recommended;
    let recommendation;

    if (focusScore >= 85 && avgDuration >= 45) {
      recommended = 60;
      recommendation = "Your focus is excellent - 60-minute sessions are optimal";
    } else if (focusScore >= 70 && avgDuration >= 30) {
      recommended = 45;
      recommendation = "45-minute sessions with short breaks recommended";
    } else if (focusScore >= 50) {
      recommended = 30;
      recommendation = "30-minute sessions help maintain focus";
    } else {
      recommended = 20;
      recommendation = "Shorter 20-minute sessions with frequent breaks";
    }

    return { minutes: recommended, recommendation };
  },

  calculateDifficultyAdjustment(recentQuizzes, profile) {
    if (!recentQuizzes?.length) {
      return { adjustment: "maintain", reason: "Insufficient data" };
    }

    const recentScores = recentQuizzes
      .filter((q) => q.quizAttemptId?.score !== undefined)
      .map((q) => (q.quizAttemptId.score / q.quizAttemptId.totalQuestions) * 100);

    if (recentScores.length < 3) {
      return { adjustment: "maintain", reason: "Need more quiz data" };
    }

    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const confidenceScore = profile?.averageConfidenceScore || 80;
    const focusScore = profile?.averageFocusScore || 80;

    if (avgScore >= 85 && confidenceScore >= 80 && focusScore >= 75) {
      return { adjustment: "increase", reason: "High performance - ready for harder content" };
    }

    if (avgScore < 60 || confidenceScore < 60 || focusScore < 60) {
      return { adjustment: "decrease", reason: "Struggling with current difficulty" };
    }

    return { adjustment: "maintain", reason: "Current difficulty is appropriate" };
  },

  generateStudySchedule(profile) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const preferredDays = profile?.preferredStudyDays || ["Monday", "Wednesday", "Friday", "Saturday"];
    const sessionLength = this.suggestSessionLength(profile).minutes;
    const optimalHours = profile?.peakStudyHours?.slice(0, 2) || [9, 19];

    const schedule = preferredDays.map((day) => ({
      day,
      suggestedTimes: optimalHours.map((h) => `${h}:00`),
      duration: sessionLength,
    }));

    return schedule;
  },

  identifyStrengths(fsrsStats, profile) {
    const strengths = [];

    if (fsrsStats?.avgRetention > 85) {
      strengths.push("Strong knowledge retention");
    }

    if (fsrsStats?.masteredCount > 50) {
      strengths.push("Many concepts mastered");
    }

    if (profile?.averageIntegrityScore > 90) {
      strengths.push("High test integrity");
    }

    if (profile?.averageEngagementScore > 85) {
      strengths.push("Excellent engagement");
    }

    if (profile?.averageFocusScore > 85) {
      strengths.push("Strong focus during sessions");
    }

    if (profile?.averageConfidenceScore > 85) {
      strengths.push("Confident in answers");
    }

    if (profile?.learningPace === "fast") {
      strengths.push("Quick learner");
    }

    return strengths.length ? strengths : ["Building foundation - keep practicing!"];
  },

  identifyWeaknesses(fsrsStats, profile) {
    const weaknesses = [];

    if (fsrsStats?.avgRetention < 70) {
      weaknesses.push("Knowledge retention needs improvement");
    }

    if (fsrsStats?.dueCards > fsrsStats?.totalCards * 0.3) {
      weaknesses.push("Many overdue reviews");
    }

    if (profile?.averageIntegrityScore < 80) {
      weaknesses.push("Frequent distractions during tests");
    }

    if (profile?.averageEngagementScore < 70) {
      weaknesses.push("Low session engagement");
    }

    if (profile?.averageFocusScore < 70) {
      weaknesses.push("Focus maintenance");
    }

    if (profile?.typicalAnswerChangeRate > 2) {
      weaknesses.push("Answer uncertainty");
    }

    return weaknesses;
  },

  suggestImprovements(recentQuizzes, profile) {
    const improvements = [];

    if (profile?.baselineTabSwitchRate > 3) {
      improvements.push("Reduce tab switching - find a quiet study environment");
    }

    if (profile?.averageFocusScore < 75) {
      improvements.push("Try shorter, more focused study sessions");
    }

    if (profile?.typicalAnswerChangeRate > 2) {
      improvements.push("Read questions carefully before answering");
    }

    const avgDuration = (profile?.averageSessionDuration || 0) / 60000;
    if (avgDuration > 60 && profile?.averageFocusScore < 80) {
      improvements.push("Take breaks during long sessions");
    }

    if (profile?.reviewPreference === "cramming") {
      improvements.push("Switch to spaced repetition for better retention");
    }

    return improvements.length ? improvements : ["Maintain current study habits"];
  },

  async calculateExamReadiness(userId) {
    const histories = await UserQuestionHistory.find({ userId })
      .populate("topicId", "subjectId");

    if (!histories.length) return { score: 0, level: "not_started", recommendation: "Begin studying to track readiness" };

    const now = new Date();
    let totalWeight = 0;
    let weightedRetention = 0;

    histories.forEach((h) => {
      const retrievability = fsrsService.getRetrievability(h, now);
      const weight = h.stability > 0 ? Math.min(h.stability / 30, 1) : 0.1;
      weightedRetention += retrievability * weight;
      totalWeight += weight;
    });

    const score = totalWeight > 0 ? Math.round((weightedRetention / totalWeight) * 100) : 0;

    let level;
    let recommendation;

    if (score >= 90) {
      level = "excellent";
      recommendation = "You're well prepared - maintain review schedule";
    } else if (score >= 75) {
      level = "good";
      recommendation = "Good progress - focus on weak topics";
    } else if (score >= 60) {
      level = "moderate";
      recommendation = "More practice needed - increase study frequency";
    } else if (score >= 40) {
      level = "developing";
      recommendation = "Significant preparation required";
    } else {
      level = "beginning";
      recommendation = "Focus on building foundation knowledge";
    }

    return { score, level, recommendation };
  },

  async identifyAtRiskTopics(userId, fsrsStats) {
    const histories = await UserQuestionHistory.find({ userId })
      .populate("topicId", "name subjectId")
      .populate({ path: "topicId", populate: { path: "subjectId", select: "name" } });

    const topicRisk = {};
    const now = new Date();

    histories.forEach((h) => {
      const topicId = h.topicId?._id?.toString();
      if (!topicId) return;

      if (!topicRisk[topicId]) {
        topicRisk[topicId] = {
          topicId,
          name: h.topicId.name,
          subjectName: h.topicId.subjectId?.name,
          lowRetentionQuestions: 0,
          totalQuestions: 0,
          avgRetention: 0,
          highDifficultyCount: 0,
        };
      }

      topicRisk[topicId].totalQuestions++;

      const retrievability = fsrsService.getRetrievability(h, now);
      topicRisk[topicId].avgRetention += retrievability;

      if (retrievability < 0.6) {
        topicRisk[topicId].lowRetentionQuestions++;
      }

      if (h.difficulty > 7) {
        topicRisk[topicId].highDifficultyCount++;
      }
    });

    Object.values(topicRisk).forEach((t) => {
      t.avgRetention = (t.avgRetention / t.totalQuestions) * 100;
      t.riskScore = (t.lowRetentionQuestions / t.totalQuestions) * 50 +
        (100 - t.avgRetention) * 0.3 +
        (t.highDifficultyCount / t.totalQuestions) * 20;
    });

    const atRisk = Object.values(topicRisk)
      .filter((t) => t.riskScore > 30 || t.avgRetention < 60)
      .sort((a, b) => b.riskScore - a.riskScore);

    return atRisk.slice(0, 5);
  },

  checkInterventionNeeded(profile, integrityEvents) {
    if (!profile) return { needed: false, reasons: [] };

    const reasons = [];

    if (profile.riskLevel === "high") {
      reasons.push("High risk behavioral pattern detected");
    }

    if (profile.averageIntegrityScore < 60) {
      reasons.push("Consistently low integrity scores");
    }

    if (profile.averageEngagementScore < 50) {
      reasons.push("Very low engagement levels");
    }

    const recentEvents = integrityEvents.filter((e) => {
      const eventTime = new Date(e.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventTime > weekAgo;
    });

    if (recentEvents.length > 20) {
      reasons.push("High frequency of integrity events");
    }

    return { needed: reasons.length >= 2, reasons };
  },

  calculateOverallIntegrity(integrityEvents, profile) {
    if (!profile) {
      return { score: 100, trend: "stable", detail: "No data available" };
    }

    const score = Math.round(profile.averageIntegrityScore || 100);
    let trend = "stable";
    let detail;

    if (score >= 90) {
      detail = "Excellent integrity maintained";
    } else if (score >= 75) {
      detail = "Good integrity with minor concerns";
    } else if (score >= 60) {
      detail = "Moderate integrity - some distractions";
    } else {
      detail = "Integrity needs attention";
    }

    return { score, trend, detail };
  },

  calculateEngagementTrend(profile) {
    if (!profile) return "stable";

    const engagement = profile.averageEngagementScore || 80;
    const focus = profile.averageFocusScore || 80;

    if (engagement > 85 && focus > 85) return "excellent";
    if (engagement > 70 && focus > 70) return "good";
    if (engagement < 60 || focus < 60) return "declining";
    return "stable";
  },

  analyzeFocusPattern(profile) {
    if (!profile?.peakStudyHours?.length) {
      return { pattern: "unknown", recommendation: "Track more sessions to analyze" };
    }

    const avgHour = profile.peakStudyHours.reduce((a, b) => a + b, 0) / profile.peakStudyHours.length;

    let pattern;
    if (avgHour < 12) {
      pattern = "morning-peak";
    } else if (avgHour < 17) {
      pattern = "afternoon-peak";
    } else {
      pattern = "evening-peak";
    }

    return {
      pattern,
      peakHours: profile.peakStudyHours.slice(0, 3),
      focusScore: profile.averageFocusScore || 80,
    };
  },

  async calculateLearningVelocity(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentHistories = await UserQuestionHistory.countDocuments({
      userId,
      lastReviewedAt: { $gte: thirtyDaysAgo },
    });

    const totalHistories = await UserQuestionHistory.countDocuments({ userId });

    const velocity = {
      questionsPerDay: Math.round(recentHistories / 30 * 10) / 10,
      totalQuestions: totalHistories,
      trend: "stable",
    };

    if (velocity.questionsPerDay > 20) {
      velocity.trend = "high";
    } else if (velocity.questionsPerDay < 5) {
      velocity.trend = "low";
    }

    return velocity;
  },

  async getAdminDSSMetrics() {
    const profiles = await UserBehaviorProfile.find({
      totalQuizzesTaken: { $gte: 5 },
    }).select("riskLevel averageIntegrityScore averageEngagementScore learningPace optimalRetention");

    const riskDistribution = { low: 0, medium: 0, high: 0 };
    const paceDistribution = { fast: 0, moderate: 0, slow: 0 };
    let totalIntegrity = 0;
    let totalEngagement = 0;
    let totalRetention = 0;

    profiles.forEach((p) => {
      riskDistribution[p.riskLevel || "low"]++;
      paceDistribution[p.learningPace || "moderate"]++;
      totalIntegrity += p.averageIntegrityScore || 100;
      totalEngagement += p.averageEngagementScore || 100;
      totalRetention += p.optimalRetention || 0.9;
    });

    const count = profiles.length || 1;

    return {
      userCount: profiles.length,
      riskDistribution,
      paceDistribution,
      averages: {
        integrity: Math.round(totalIntegrity / count),
        engagement: Math.round(totalEngagement / count),
        optimalRetention: Math.round((totalRetention / count) * 100),
      },
    };
  },

  async getPredictiveAnalytics(userId) {
    const [histories, recentQuizzes, profile] = await Promise.all([
      UserQuestionHistory.find({ userId }).populate("topicId", "name subjectId"),
      QuizSessionBehavior.find({ userId }).sort({ createdAt: -1 }).limit(20).populate("quizAttemptId", "score totalQuestions"),
      UserBehaviorProfile.findOne({ userId }),
    ]);

    const now = new Date();
    const predictions = {
      examSuccessProbability: 0,
      optimalStudyHours: [],
      predictedWeakAreas: [],
      retentionForecast: [],
      studyEfficiencyScore: 0,
    };

    if (histories.length > 0) {
      let totalRetrievability = 0;
      histories.forEach((h) => {
        totalRetrievability += fsrsService.getRetrievability(h, now);
      });
      const avgRetention = totalRetrievability / histories.length;
      predictions.examSuccessProbability = Math.round(avgRetention * 100 * 0.85);
    }

    if (profile?.peakStudyHours?.length > 0) {
      predictions.optimalStudyHours = profile.peakStudyHours.slice(0, 3);
    } else {
      predictions.optimalStudyHours = [9, 14, 20];
    }

    const topicRetention = {};
    histories.forEach((h) => {
      const topicId = h.topicId?._id?.toString();
      if (!topicId) return;
      if (!topicRetention[topicId]) {
        topicRetention[topicId] = { name: h.topicId.name, total: 0, count: 0 };
      }
      topicRetention[topicId].total += fsrsService.getRetrievability(h, now);
      topicRetention[topicId].count++;
    });

    predictions.predictedWeakAreas = Object.values(topicRetention)
      .map((t) => ({ name: t.name, retention: Math.round((t.total / t.count) * 100) }))
      .filter((t) => t.retention < 70)
      .sort((a, b) => a.retention - b.retention)
      .slice(0, 5);

    for (let i = 0; i < 7; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      let dayRetention = 0;
      let count = 0;
      histories.forEach((h) => {
        const ret = fsrsService.getRetrievability(h, futureDate);
        dayRetention += ret;
        count++;
      });
      predictions.retentionForecast.push({
        day: i,
        date: futureDate.toISOString().split("T")[0],
        predictedRetention: count > 0 ? Math.round((dayRetention / count) * 100) : 0,
      });
    }

    if (recentQuizzes.length > 0 && profile) {
      const avgScore = recentQuizzes
        .filter((q) => q.quizAttemptId?.score !== undefined)
        .reduce((sum, q) => sum + (q.quizAttemptId.score / q.quizAttemptId.totalQuestions) * 100, 0) / recentQuizzes.length;
      const focusMultiplier = (profile.averageFocusScore || 80) / 100;
      predictions.studyEfficiencyScore = Math.round(avgScore * focusMultiplier);
    }

    return predictions;
  },

  async getTopicLevelPredictions(userId, topicId) {
    const histories = await UserQuestionHistory.find({ userId, topicId });
    const now = new Date();

    if (histories.length === 0) {
      return { topicId, hasData: false, message: "No data available for this topic" };
    }

    let totalRetention = 0;
    let masteredCount = 0;
    let dueCount = 0;

    histories.forEach((h) => {
      const retrievability = fsrsService.getRetrievability(h, now);
      totalRetention += retrievability;
      if (retrievability > 0.9 && (h.stability || 0) > 21) masteredCount++;
      if (h.nextReviewDate && new Date(h.nextReviewDate) <= now) dueCount++;
    });

    const avgRetention = totalRetention / histories.length;
    const masteryPercentage = (masteredCount / histories.length) * 100;

    let daysToMastery = 0;
    if (masteryPercentage < 80) {
      const remainingToMaster = histories.length * 0.8 - masteredCount;
      daysToMastery = Math.ceil(remainingToMaster * 3);
    }

    return {
      topicId,
      hasData: true,
      totalQuestions: histories.length,
      currentRetention: Math.round(avgRetention * 100),
      masteryPercentage: Math.round(masteryPercentage),
      dueForReview: dueCount,
      predictedDaysToMastery: daysToMastery,
      recommendation: masteryPercentage >= 80 ? "maintain" : masteryPercentage >= 50 ? "practice" : "focus",
    };
  },

  async getStudyLoadForecast(userId, days = 7) {
    const histories = await UserQuestionHistory.find({ userId });
    const now = new Date();
    const forecast = [];

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + i);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      let dueCount = 0;
      histories.forEach((h) => {
        if (h.nextReviewDate) {
          const dueDate = new Date(h.nextReviewDate);
          if (dueDate >= startOfDay && dueDate <= endOfDay) dueCount++;
        }
      });

      forecast.push({
        day: i,
        date: startOfDay.toISOString().split("T")[0],
        dayName: startOfDay.toLocaleDateString("en-US", { weekday: "short" }),
        dueReviews: dueCount,
        estimatedMinutes: dueCount * 2,
        load: dueCount > 30 ? "high" : dueCount > 15 ? "medium" : "low",
      });
    }

    return forecast;
  },

  async getExamCountdownPlan(userId, examDate, examLevel = "Professional") {
    const now = new Date();
    const exam = new Date(examDate);
    const daysUntilExam = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExam < 0) {
      return { error: true, message: "Exam date has passed" };
    }

    const [readiness, fsrsStats, atRiskTopics, studyForecast] = await Promise.all([
      this.calculateExamReadiness(userId),
      this.getFSRSStats(userId),
      this.identifyAtRiskTopics(userId),
      this.getStudyLoadForecast(userId, Math.min(daysUntilExam, 14)),
    ]);

    const phases = this.generateStudyPhases(daysUntilExam, readiness.score);
    const dailyPlan = this.generateDailyPlan(daysUntilExam, fsrsStats, atRiskTopics);
    const criticalActions = this.identifyCriticalActions(daysUntilExam, readiness, atRiskTopics, fsrsStats);

    return {
      examDate: exam.toISOString(),
      daysUntilExam,
      examLevel,
      currentReadiness: readiness,
      phases,
      dailyPlan,
      criticalActions,
      studyForecast,
      atRiskTopics: atRiskTopics.slice(0, 5),
      stats: {
        totalCards: fsrsStats.totalCards,
        masteredCards: fsrsStats.masteredCount,
        dueCards: fsrsStats.dueCards,
        avgRetention: Math.round(fsrsStats.avgRetention),
      },
    };
  },

  generateStudyPhases(daysUntilExam, currentReadiness) {
    const phases = [];

    if (daysUntilExam > 30) {
      phases.push({
        name: "Foundation Building",
        duration: `Day 1 - ${Math.floor(daysUntilExam * 0.4)}`,
        focus: "Learn new content, build knowledge base",
        activities: ["Complete all subjects", "Take notes", "Initial practice"],
        dailyGoal: { newContent: 60, review: 40 },
      });
      phases.push({
        name: "Deep Practice",
        duration: `Day ${Math.floor(daysUntilExam * 0.4) + 1} - ${Math.floor(daysUntilExam * 0.75)}`,
        focus: "Intensive practice, address weak areas",
        activities: ["Focus on weak topics", "Timed quizzes", "Error analysis"],
        dailyGoal: { newContent: 20, review: 80 },
      });
      phases.push({
        name: "Final Review",
        duration: `Day ${Math.floor(daysUntilExam * 0.75) + 1} - ${daysUntilExam}`,
        focus: "Consolidation and confidence building",
        activities: ["Mock exams", "Quick reviews", "Rest before exam"],
        dailyGoal: { newContent: 0, review: 100 },
      });
    } else if (daysUntilExam > 14) {
      phases.push({
        name: "Intensive Review",
        duration: `Day 1 - ${Math.floor(daysUntilExam * 0.7)}`,
        focus: "Cover all weak areas, heavy practice",
        activities: ["Prioritize weak topics", "Daily quizzes", "Spaced repetition"],
        dailyGoal: { newContent: 10, review: 90 },
      });
      phases.push({
        name: "Final Polish",
        duration: `Day ${Math.floor(daysUntilExam * 0.7) + 1} - ${daysUntilExam}`,
        focus: "Mock exams and confidence",
        activities: ["Full mock exams", "Light review", "Mental preparation"],
        dailyGoal: { newContent: 0, review: 100 },
      });
    } else if (daysUntilExam > 7) {
      phases.push({
        name: "Crunch Time",
        duration: `Day 1 - ${daysUntilExam - 2}`,
        focus: "Maximum review efficiency",
        activities: ["High-yield topics only", "Rapid fire quizzes", "Error correction"],
        dailyGoal: { newContent: 0, review: 100 },
      });
      phases.push({
        name: "Pre-Exam",
        duration: `Day ${daysUntilExam - 1} - ${daysUntilExam}`,
        focus: "Light review, rest",
        activities: ["Light reading", "Rest", "Prepare materials"],
        dailyGoal: { newContent: 0, review: 50 },
      });
    } else {
      phases.push({
        name: "Final Days",
        duration: `Day 1 - ${daysUntilExam}`,
        focus: "Light review, maintain confidence",
        activities: ["Quick reviews", "Rest well", "Stay calm"],
        dailyGoal: { newContent: 0, review: 30 },
      });
    }

    return phases;
  },

  generateDailyPlan(daysUntilExam, fsrsStats, atRiskTopics) {
    const baseDailyReviews = Math.max(10, Math.ceil(fsrsStats.dueCards / Math.max(daysUntilExam, 1)));
    const basePracticeMinutes = daysUntilExam > 14 ? 60 : daysUntilExam > 7 ? 45 : 30;

    return {
      reviewTarget: Math.min(baseDailyReviews, 50),
      practiceMinutes: basePracticeMinutes,
      newQuestionsTarget: daysUntilExam > 14 ? 10 : 0,
      focusTopics: atRiskTopics.slice(0, 3).map((t) => ({ id: t.topicId, name: t.name })),
      mockExamFrequency: daysUntilExam > 14 ? "weekly" : daysUntilExam > 7 ? "every_3_days" : "daily",
      breakRecommendation: basePracticeMinutes > 45 ? "Every 25 minutes" : "Every 30 minutes",
    };
  },

  identifyCriticalActions(daysUntilExam, readiness, atRiskTopics, fsrsStats) {
    const actions = [];

    if (fsrsStats.dueCards > 20) {
      actions.push({
        priority: "critical",
        action: `Clear ${fsrsStats.dueCards} overdue reviews`,
        reason: "Overdue items hurt retention",
        timeEstimate: `${Math.ceil(fsrsStats.dueCards * 1.5)} minutes`,
      });
    }

    if (atRiskTopics.length > 0) {
      actions.push({
        priority: "high",
        action: `Focus on weak topic: ${atRiskTopics[0].name}`,
        reason: `Only ${Math.round(atRiskTopics[0].avgRetention)}% retention`,
        timeEstimate: "30-45 minutes daily",
      });
    }

    if (readiness.score < 60) {
      actions.push({
        priority: "critical",
        action: "Increase daily study time significantly",
        reason: "Current readiness below minimum threshold",
        timeEstimate: "Add 30+ minutes daily",
      });
    } else if (readiness.score < 75) {
      actions.push({
        priority: "high",
        action: "Maintain consistent daily practice",
        reason: "Readiness needs improvement",
        timeEstimate: "45-60 minutes daily",
      });
    }

    if (daysUntilExam <= 7 && readiness.score < 80) {
      actions.push({
        priority: "critical",
        action: "Take a full mock exam immediately",
        reason: "Need to assess real exam conditions",
        timeEstimate: "2-3 hours",
      });
    }

    if (daysUntilExam <= 3) {
      actions.push({
        priority: "medium",
        action: "Prioritize rest and light review",
        reason: "Cramming is counterproductive at this stage",
        timeEstimate: "30 minutes max",
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },

  async getPerformanceTrend(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await QuizSessionBehavior.find({
      userId,
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: 1 })
      .populate("quizAttemptId", "score totalQuestions");

    const trend = [];
    const dateMap = {};

    sessions.forEach((session) => {
      const dateKey = session.createdAt.toISOString().split("T")[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { scores: [], integrity: [], focus: [] };
      }
      if (session.quizAttemptId?.score !== undefined) {
        const scorePercent = (session.quizAttemptId.score / session.quizAttemptId.totalQuestions) * 100;
        dateMap[dateKey].scores.push(scorePercent);
      }
      dateMap[dateKey].integrity.push(session.integrityScore || 100);
      dateMap[dateKey].focus.push(session.focusScore || 100);
    });

    Object.entries(dateMap).forEach(([date, data]) => {
      const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      trend.push({
        date,
        avgScore: Math.round(avg(data.scores)),
        avgIntegrity: Math.round(avg(data.integrity)),
        avgFocus: Math.round(avg(data.focus)),
        sessionCount: data.scores.length,
      });
    });

    let direction = "stable";
    if (trend.length >= 5) {
      const recent = trend.slice(-5);
      const older = trend.slice(0, 5);
      const recentAvg = recent.reduce((sum, t) => sum + t.avgScore, 0) / recent.length;
      const olderAvg = older.reduce((sum, t) => sum + t.avgScore, 0) / older.length;
      if (recentAvg > olderAvg + 5) direction = "improving";
      else if (recentAvg < olderAvg - 5) direction = "declining";
    }

    return { trend, direction, totalSessions: sessions.length };
  },
};

export default dssService;
