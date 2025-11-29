import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import QuizSessionBehavior from "../models/QuizSessionBehavior.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const INTERVENTION_THRESHOLDS = {
  integrityScore: {
    critical: 50,
    warning: 70,
  },
  engagementScore: {
    critical: 40,
    warning: 60,
  },
  focusScore: {
    critical: 50,
    warning: 65,
  },
  tabSwitchRate: {
    critical: 10,
    warning: 5,
  },
  consecutiveLowScores: 3,
  inactivityDays: 7,
};

const INTERVENTION_TYPES = {
  INTEGRITY_ALERT: "integrity_alert",
  ENGAGEMENT_DROP: "engagement_drop",
  FOCUS_CONCERN: "focus_concern",
  PERFORMANCE_DECLINE: "performance_decline",
  INACTIVITY_WARNING: "inactivity_warning",
  HIGH_RISK_BEHAVIOR: "high_risk_behavior",
  STUDY_PATTERN_ISSUE: "study_pattern_issue",
};

const interventionService = {
  async checkInterventionTriggers(userId) {
    const [profile, recentSessions] = await Promise.all([
      UserBehaviorProfile.findOne({ userId }),
      QuizSessionBehavior.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const interventions = [];

    if (!profile) {
      return { triggers: [], interventions: [] };
    }

    if (profile.averageIntegrityScore < INTERVENTION_THRESHOLDS.integrityScore.critical) {
      interventions.push({
        type: INTERVENTION_TYPES.INTEGRITY_ALERT,
        severity: "critical",
        message: "Integrity score critically low",
        score: profile.averageIntegrityScore,
        recommendation: "Review test-taking environment and minimize distractions",
      });
    } else if (profile.averageIntegrityScore < INTERVENTION_THRESHOLDS.integrityScore.warning) {
      interventions.push({
        type: INTERVENTION_TYPES.INTEGRITY_ALERT,
        severity: "warning",
        message: "Integrity score below optimal",
        score: profile.averageIntegrityScore,
        recommendation: "Consider using full-screen mode during quizzes",
      });
    }

    if (profile.averageEngagementScore < INTERVENTION_THRESHOLDS.engagementScore.critical) {
      interventions.push({
        type: INTERVENTION_TYPES.ENGAGEMENT_DROP,
        severity: "critical",
        message: "Engagement level critically low",
        score: profile.averageEngagementScore,
        recommendation: "Try shorter study sessions with breaks",
      });
    } else if (profile.averageEngagementScore < INTERVENTION_THRESHOLDS.engagementScore.warning) {
      interventions.push({
        type: INTERVENTION_TYPES.ENGAGEMENT_DROP,
        severity: "warning",
        message: "Engagement declining",
        score: profile.averageEngagementScore,
        recommendation: "Consider varying your study materials",
      });
    }

    if (profile.averageFocusScore < INTERVENTION_THRESHOLDS.focusScore.critical) {
      interventions.push({
        type: INTERVENTION_TYPES.FOCUS_CONCERN,
        severity: "critical",
        message: "Focus score critically low",
        score: profile.averageFocusScore,
        recommendation: "Find a quieter study environment",
      });
    }

    if (profile.baselineTabSwitchRate > INTERVENTION_THRESHOLDS.tabSwitchRate.critical) {
      interventions.push({
        type: INTERVENTION_TYPES.HIGH_RISK_BEHAVIOR,
        severity: "critical",
        message: "Excessive tab switching detected",
        rate: profile.baselineTabSwitchRate,
        recommendation: "Close unnecessary browser tabs before studying",
      });
    }

    const performanceDecline = this.detectPerformanceDecline(recentSessions);
    if (performanceDecline.detected) {
      interventions.push({
        type: INTERVENTION_TYPES.PERFORMANCE_DECLINE,
        severity: performanceDecline.severity,
        message: performanceDecline.message,
        trend: performanceDecline.trend,
        recommendation: performanceDecline.recommendation,
      });
    }

    const inactivity = await this.checkInactivity(userId, profile);
    if (inactivity.detected) {
      interventions.push({
        type: INTERVENTION_TYPES.INACTIVITY_WARNING,
        severity: inactivity.severity,
        message: inactivity.message,
        daysSinceLastSession: inactivity.days,
        recommendation: "Resume studying to maintain your progress",
      });
    }

    return {
      triggers: interventions.map((i) => i.type),
      interventions,
      overallRisk: this.calculateOverallRisk(interventions),
      needsAdminReview: interventions.some((i) => i.severity === "critical"),
    };
  },

  detectPerformanceDecline(sessions) {
    if (!sessions || sessions.length < 5) {
      return { detected: false };
    }

    const scores = sessions
      .filter((s) => s.integrityScore !== undefined)
      .map((s) => s.integrityScore);

    if (scores.length < 3) {
      return { detected: false };
    }

    const recentAvg = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = scores.slice(3).reduce((a, b) => a + b, 0) / (scores.length - 3);

    const decline = olderAvg - recentAvg;

    if (decline > 20) {
      return {
        detected: true,
        severity: "critical",
        message: "Significant performance decline detected",
        trend: { recentAvg, olderAvg, decline },
        recommendation: "Review recent topics and consider additional practice",
      };
    }

    if (decline > 10) {
      return {
        detected: true,
        severity: "warning",
        message: "Slight performance decline noticed",
        trend: { recentAvg, olderAvg, decline },
        recommendation: "Focus on areas where you feel less confident",
      };
    }

    return { detected: false };
  },

  async checkInactivity(userId, profile) {
    const lastSession = await QuizSessionBehavior.findOne({ userId })
      .sort({ createdAt: -1 });

    if (!lastSession) {
      return { detected: false };
    }

    const daysSince = Math.floor(
      (Date.now() - lastSession.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince >= INTERVENTION_THRESHOLDS.inactivityDays * 2) {
      return {
        detected: true,
        severity: "critical",
        message: "Extended period of inactivity",
        days: daysSince,
      };
    }

    if (daysSince >= INTERVENTION_THRESHOLDS.inactivityDays) {
      return {
        detected: true,
        severity: "warning",
        message: "No recent study activity",
        days: daysSince,
      };
    }

    return { detected: false };
  },

  calculateOverallRisk(interventions) {
    if (!interventions.length) return "low";

    const criticalCount = interventions.filter((i) => i.severity === "critical").length;
    const warningCount = interventions.filter((i) => i.severity === "warning").length;

    if (criticalCount >= 2 || (criticalCount >= 1 && warningCount >= 2)) {
      return "high";
    }

    if (criticalCount >= 1 || warningCount >= 2) {
      return "medium";
    }

    return "low";
  },

  async getAdminInterventionDashboard() {
    const profiles = await UserBehaviorProfile.find({
      $or: [
        { riskLevel: "high" },
        { averageIntegrityScore: { $lt: 70 } },
        { averageEngagementScore: { $lt: 60 } },
      ],
    })
      .populate("userId", "firstName lastName email")
      .sort({ riskLevel: -1, averageIntegrityScore: 1 });

    const interventionSummary = {
      high: [],
      medium: [],
      low: [],
    };

    for (const profile of profiles) {
      const result = await this.checkInterventionTriggers(profile.userId);
      const entry = {
        user: profile.userId,
        profile: {
          integrityScore: profile.averageIntegrityScore,
          engagementScore: profile.averageEngagementScore,
          focusScore: profile.averageFocusScore,
          riskLevel: profile.riskLevel,
        },
        interventions: result.interventions,
        triggers: result.triggers,
      };

      interventionSummary[result.overallRisk].push(entry);
    }

    return {
      summary: {
        highRisk: interventionSummary.high.length,
        mediumRisk: interventionSummary.medium.length,
        lowRisk: interventionSummary.low.length,
      },
      users: interventionSummary,
    };
  },

  async recordIntervention(userId, interventionType, adminId, notes) {
    const profile = await UserBehaviorProfile.findOne({ userId });
    if (!profile) return null;

    if (!profile.interventionHistory) {
      profile.interventionHistory = [];
    }

    profile.interventionHistory.push({
      type: interventionType,
      triggeredAt: new Date(),
      reviewedBy: adminId,
      notes,
    });

    await profile.save();
    return profile;
  },

  async getInterventionRecommendations(profile, behaviorData) {
    const recommendations = [];

    if (profile.averageIntegrityScore < 80) {
      recommendations.push({
        category: "integrity",
        priority: profile.averageIntegrityScore < 60 ? "high" : "medium",
        action: "Enable proctoring features",
        details: "Consider using full-screen mode and disabling tab switching",
      });
    }

    if (profile.averageFocusScore < 75) {
      recommendations.push({
        category: "focus",
        priority: profile.averageFocusScore < 50 ? "high" : "medium",
        action: "Shorten study sessions",
        details: `Recommended session length: ${Math.max(15, Math.floor(profile.averageFocusScore / 5))} minutes`,
      });
    }

    if (profile.typicalAnswerChangeRate > 2) {
      recommendations.push({
        category: "confidence",
        priority: "medium",
        action: "Improve answer confidence",
        details: "Practice reading questions carefully before answering",
      });
    }

    if (profile.learningPace === "slow" && profile.reviewPreference === "cramming") {
      recommendations.push({
        category: "study_habits",
        priority: "high",
        action: "Switch to spaced repetition",
        details: "Distribute study sessions over multiple days for better retention",
      });
    }

    return recommendations;
  },

  async applyAutoIntervention(userId, interventionType) {
    const profile = await UserBehaviorProfile.findOne({ userId });
    if (!profile) return null;

    const adjustments = {};

    switch (interventionType) {
      case INTERVENTION_TYPES.FOCUS_CONCERN:
        adjustments.recommendedSessionLength = Math.max(15, Math.floor((profile.averageFocusScore || 60) / 4));
        adjustments.breakReminders = true;
        break;

      case INTERVENTION_TYPES.ENGAGEMENT_DROP:
        adjustments.gamificationBoost = true;
        adjustments.varietyInQuestions = true;
        break;

      case INTERVENTION_TYPES.PERFORMANCE_DECLINE:
        adjustments.difficultyReduction = true;
        adjustments.reviewMode = true;
        break;

      case INTERVENTION_TYPES.HIGH_RISK_BEHAVIOR:
        adjustments.strictMode = true;
        adjustments.proctoringLevel = "enhanced";
        break;
    }

    profile.autoInterventions = {
      ...profile.autoInterventions,
      ...adjustments,
      lastAppliedAt: new Date(),
    };

    await profile.save();
    return { profile, adjustments };
  },
};

export default interventionService;
