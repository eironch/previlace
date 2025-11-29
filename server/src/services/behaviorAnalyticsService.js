import QuizSessionBehavior from "../models/QuizSessionBehavior.js";
import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import QuizAttempt from "../models/QuizAttempt.js";
import mongoose from "mongoose";

const behaviorAnalyticsService = {
  async saveQuizBehavior(userId, quizAttemptId, behaviorData) {
    const {
      totalDuration,
      activeTime,
      idleTime,
      questionTimings,
      integrityEvents,
      answerBehavior,
      posthogSessionId,
    } = behaviorData;

    let sessionBehavior = await QuizSessionBehavior.findOne({ quizAttemptId });

    if (sessionBehavior) {
      sessionBehavior.totalDuration = totalDuration || sessionBehavior.totalDuration;
      sessionBehavior.activeTime = activeTime || sessionBehavior.activeTime;
      sessionBehavior.idleTime = idleTime || sessionBehavior.idleTime;

      if (questionTimings?.length > 0) {
        sessionBehavior.questionTimings = questionTimings;
      }
      if (integrityEvents?.length > 0) {
        sessionBehavior.integrityEvents = [
          ...sessionBehavior.integrityEvents,
          ...integrityEvents,
        ];
      }
      if (answerBehavior?.length > 0) {
        sessionBehavior.answerBehavior = answerBehavior;
      }
      if (posthogSessionId) {
        sessionBehavior.posthogSessionId = posthogSessionId;
      }
    } else {
      sessionBehavior = new QuizSessionBehavior({
        userId,
        quizAttemptId,
        totalDuration: totalDuration || 0,
        activeTime: activeTime || 0,
        idleTime: idleTime || 0,
        questionTimings: questionTimings || [],
        integrityEvents: integrityEvents || [],
        answerBehavior: answerBehavior || [],
        posthogSessionId,
      });
    }

    sessionBehavior.calculateAllScores();
    await sessionBehavior.save();

    await this.updateUserProfile(userId, sessionBehavior);

    return sessionBehavior;
  },

  async updateUserProfile(userId, sessionBehavior) {
    const profile = await UserBehaviorProfile.getOrCreate(userId);
    await profile.updateFromSession(sessionBehavior);
    return profile;
  },

  async completeQuizBehavior(quizAttemptId) {
    const sessionBehavior = await QuizSessionBehavior.findOne({ quizAttemptId });
    if (!sessionBehavior) return null;

    sessionBehavior.completedAt = new Date();
    sessionBehavior.calculateAllScores();
    await sessionBehavior.save();

    return sessionBehavior;
  },

  async addIntegrityEvents(quizAttemptId, events) {
    const sessionBehavior = await QuizSessionBehavior.findOne({ quizAttemptId });
    if (!sessionBehavior) return null;

    sessionBehavior.integrityEvents.push(...events);
    sessionBehavior.calculateIntegrityScore();
    sessionBehavior.checkForFlags();
    await sessionBehavior.save();

    return sessionBehavior;
  },

  async getQuizBehavior(quizAttemptId) {
    return QuizSessionBehavior.findOne({ quizAttemptId })
      .populate("userId", "firstName lastName email")
      .populate("quizAttemptId");
  },

  async getUserBehaviorProfile(userId) {
    return UserBehaviorProfile.getOrCreate(userId);
  },

  async getIntegrityStats(userId) {
    const stats = await QuizSessionBehavior.getIntegrityStats(userId);
    const profile = await UserBehaviorProfile.findOne({ userId });

    return {
      aggregated: stats[0] || {
        averageIntegrity: 100,
        averageEngagement: 100,
        averageFocus: 100,
        averageConfidence: 100,
        totalSessions: 0,
        flaggedCount: 0,
      },
      profile: profile || null,
    };
  },

  async getBehaviorTrends(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await QuizSessionBehavior.find({
      userId,
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: 1 })
      .select("integrityScore engagementScore focusScore confidenceScore createdAt");

    const dailyData = {};
    sessions.forEach((session) => {
      const dateKey = session.createdAt.toISOString().split("T")[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          integrity: [],
          engagement: [],
          focus: [],
          confidence: [],
        };
      }
      dailyData[dateKey].integrity.push(session.integrityScore);
      dailyData[dateKey].engagement.push(session.engagementScore);
      dailyData[dateKey].focus.push(session.focusScore);
      dailyData[dateKey].confidence.push(session.confidenceScore);
    });

    return Object.values(dailyData).map((day) => ({
      date: day.date,
      integrity: this.average(day.integrity),
      engagement: this.average(day.engagement),
      focus: this.average(day.focus),
      confidence: this.average(day.confidence),
      sessionCount: day.integrity.length,
    }));
  },

  async getFlaggedSessions(filters = {}) {
    return QuizSessionBehavior.getFlaggedSessions(filters);
  },

  async reviewFlaggedSession(sessionId, reviewerId, reviewNotes) {
    const session = await QuizSessionBehavior.findById(sessionId);
    if (!session) return null;

    session.reviewedAt = new Date();
    session.reviewedBy = reviewerId;
    session.reviewNotes = reviewNotes;
    await session.save();

    return session;
  },

  async getAdminOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [todaySessions, weekSessions, monthSessions, flaggedCount] = await Promise.all([
      QuizSessionBehavior.countDocuments({ createdAt: { $gte: today } }),
      QuizSessionBehavior.countDocuments({ createdAt: { $gte: weekAgo } }),
      QuizSessionBehavior.countDocuments({ createdAt: { $gte: monthAgo } }),
      QuizSessionBehavior.countDocuments({ flaggedForReview: true, reviewedAt: { $exists: false } }),
    ]);

    const avgScores = await QuizSessionBehavior.aggregate([
      { $match: { createdAt: { $gte: monthAgo } } },
      {
        $group: {
          _id: null,
          avgIntegrity: { $avg: "$integrityScore" },
          avgEngagement: { $avg: "$engagementScore" },
          avgFocus: { $avg: "$focusScore" },
          avgConfidence: { $avg: "$confidenceScore" },
        },
      },
    ]);

    return {
      sessions: {
        today: todaySessions,
        week: weekSessions,
        month: monthSessions,
      },
      flaggedCount,
      averages: avgScores[0] || {
        avgIntegrity: 100,
        avgEngagement: 100,
        avgFocus: 100,
        avgConfidence: 100,
      },
    };
  },

  async getAdminBehaviorPatterns() {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const sessions = await QuizSessionBehavior.find({ createdAt: { $gte: monthAgo } });

    const tabSwitchCounts = sessions.map(
      (s) => s.integrityEvents.filter((e) => e.type === "tab_switch").length
    );
    const focusLossCounts = sessions.map(
      (s) => s.integrityEvents.filter((e) => e.type === "focus_lost").length
    );

    const hourCounts = {};
    sessions.forEach((s) => {
      const hour = s.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([hour]) => parseInt(hour));

    return {
      tabSwitchRate: {
        average: this.average(tabSwitchCounts),
        distribution: this.getDistribution(tabSwitchCounts, [0, 2, 4, 6]),
      },
      focusLossRate: {
        average: this.average(focusLossCounts),
        distribution: this.getDistribution(focusLossCounts, [0, 2, 4, 6]),
      },
      peakUsageHours: peakHours,
      totalSessions: sessions.length,
    };
  },

  async getIntegrityDistribution() {
    const distribution = await QuizSessionBehavior.aggregate([
      {
        $bucket: {
          groupBy: "$integrityScore",
          boundaries: [0, 60, 70, 80, 90, 101],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const total = distribution.reduce((sum, bucket) => sum + bucket.count, 0);

    return distribution.map((bucket) => ({
      range: this.getBucketLabel(bucket._id),
      count: bucket.count,
      percentage: total > 0 ? Math.round((bucket.count / total) * 100) : 0,
    }));
  },

  async getInterventionQueue() {
    const atRiskUsers = await UserBehaviorProfile.getAtRiskUsers();
    const flaggedSessions = await QuizSessionBehavior.find({
      flaggedForReview: true,
      reviewedAt: { $exists: false },
    })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(50);

    const userFlagCounts = {};
    flaggedSessions.forEach((session) => {
      const id = session.userId._id.toString();
      if (!userFlagCounts[id]) {
        userFlagCounts[id] = {
          userId: session.userId._id,
          user: session.userId,
          flaggedSessions: 0,
          reasons: new Set(),
          lastFlagged: session.createdAt,
        };
      }
      userFlagCounts[id].flaggedSessions++;
      session.flagReasons.forEach((r) => userFlagCounts[id].reasons.add(r));
    });

    const interventionQueue = Object.values(userFlagCounts)
      .map((item) => ({
        ...item,
        reasons: Array.from(item.reasons),
        priority: item.flaggedSessions >= 3 ? "high" : item.flaggedSessions >= 2 ? "medium" : "low",
      }))
      .sort((a, b) => b.flaggedSessions - a.flaggedSessions);

    return {
      interventionQueue,
      atRiskUsers,
      totalFlagged: flaggedSessions.length,
    };
  },

  async getUserBehaviorDetail(userId) {
    const [profile, recentSessions, integrityStats] = await Promise.all([
      UserBehaviorProfile.findOne({ userId }).populate("userId", "firstName lastName email"),
      QuizSessionBehavior.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("quizAttemptId", "title mode score"),
      QuizSessionBehavior.getIntegrityStats(userId),
    ]);

    return {
      profile,
      recentSessions,
      stats: integrityStats[0] || null,
    };
  },

  average(arr) {
    if (!arr || arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  },

  getDistribution(arr, boundaries) {
    const result = [];
    for (let i = 0; i < boundaries.length; i++) {
      const min = boundaries[i];
      const max = boundaries[i + 1] ?? Infinity;
      const count = arr.filter((v) => v >= min && v < max).length;
      result.push({
        range: max === Infinity ? `${min}+` : `${min}-${max - 1}`,
        count,
        percentage: arr.length > 0 ? Math.round((count / arr.length) * 100) : 0,
      });
    }
    return result;
  },

  getBucketLabel(value) {
    const labels = {
      0: "<60",
      60: "60-69",
      70: "70-79",
      80: "80-89",
      90: "90-100",
    };
    return labels[value] || "Other";
  },

  async detectBehaviorAnomalies(userId) {
    const profile = await UserBehaviorProfile.findOne({ userId });
    if (!profile) return { anomalies: [], riskLevel: "low" };

    const recentSessions = await QuizSessionBehavior.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const anomalies = [];
    const thresholds = {
      tabSwitchRate: profile.baselineTabSwitchRate * 2 || 5,
      focusDropThreshold: 20,
      integrityDropThreshold: 25,
      answerChangeSpike: profile.typicalAnswerChangeRate * 2 || 4,
    };

    recentSessions.forEach((session) => {
      const tabSwitches = session.integrityEvents?.filter((e) => e.type === "tab_switch").length || 0;
      if (tabSwitches > thresholds.tabSwitchRate) {
        anomalies.push({
          type: "high_tab_switches",
          sessionId: session._id,
          value: tabSwitches,
          threshold: thresholds.tabSwitchRate,
          severity: tabSwitches > thresholds.tabSwitchRate * 2 ? "high" : "medium",
        });
      }

      if (profile.averageFocusScore - (session.focusScore || 100) > thresholds.focusDropThreshold) {
        anomalies.push({
          type: "focus_drop",
          sessionId: session._id,
          value: session.focusScore,
          baseline: profile.averageFocusScore,
          severity: "medium",
        });
      }

      if (profile.averageIntegrityScore - (session.integrityScore || 100) > thresholds.integrityDropThreshold) {
        anomalies.push({
          type: "integrity_drop",
          sessionId: session._id,
          value: session.integrityScore,
          baseline: profile.averageIntegrityScore,
          severity: "high",
        });
      }

      const avgAnswerChanges = session.answerBehavior?.reduce((sum, ab) => sum + (ab.totalChanges || 0), 0) / (session.answerBehavior?.length || 1) || 0;
      if (avgAnswerChanges > thresholds.answerChangeSpike) {
        anomalies.push({
          type: "answer_uncertainty",
          sessionId: session._id,
          value: avgAnswerChanges,
          threshold: thresholds.answerChangeSpike,
          severity: "low",
        });
      }
    });

    const highSeverity = anomalies.filter((a) => a.severity === "high").length;
    const mediumSeverity = anomalies.filter((a) => a.severity === "medium").length;

    let riskLevel = "low";
    if (highSeverity >= 2 || (highSeverity >= 1 && mediumSeverity >= 2)) {
      riskLevel = "high";
    } else if (highSeverity >= 1 || mediumSeverity >= 2) {
      riskLevel = "medium";
    }

    return { anomalies, riskLevel, totalAnomalies: anomalies.length };
  },

  async getLearningPatternAnalysis(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await QuizSessionBehavior.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: 1 })
      .populate("quizAttemptId", "score totalQuestions");

    if (sessions.length < 5) {
      return { hasEnoughData: false, message: "Need at least 5 sessions for analysis" };
    }

    const hourDistribution = {};
    const dayDistribution = {};
    const performanceByHour = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    sessions.forEach((session) => {
      const date = new Date(session.createdAt);
      const hour = date.getHours();
      const day = days[date.getDay()];

      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
      dayDistribution[day] = (dayDistribution[day] || 0) + 1;

      if (session.quizAttemptId?.score !== undefined) {
        const score = (session.quizAttemptId.score / session.quizAttemptId.totalQuestions) * 100;
        if (!performanceByHour[hour]) performanceByHour[hour] = [];
        performanceByHour[hour].push(score);
      }
    });

    const peakHours = Object.entries(hourDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const preferredDays = Object.entries(dayDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    const bestPerformanceHours = Object.entries(performanceByHour)
      .map(([hour, scores]) => ({
        hour: parseInt(hour),
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3)
      .map((h) => h.hour);

    const recentScores = sessions
      .filter((s) => s.quizAttemptId?.score !== undefined)
      .slice(-10)
      .map((s) => (s.quizAttemptId.score / s.quizAttemptId.totalQuestions) * 100);

    let trend = "stable";
    if (recentScores.length >= 5) {
      const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
      const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (secondAvg > firstAvg + 5) trend = "improving";
      else if (secondAvg < firstAvg - 5) trend = "declining";
    }

    return {
      hasEnoughData: true,
      peakStudyHours: peakHours,
      preferredDays,
      bestPerformanceHours,
      performanceTrend: trend,
      totalSessions: sessions.length,
      avgSessionsPerWeek: Math.round((sessions.length / 4) * 10) / 10,
    };
  },
};

export default behaviorAnalyticsService;
