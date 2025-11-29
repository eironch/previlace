import QuizSessionBehavior from "../models/QuizSessionBehavior.js";
import UserBehaviorProfile from "../models/UserBehaviorProfile.js";

const INTEGRITY_WEIGHTS = {
  tab_switch: { short: 2, long: 5 },
  focus_lost: { short: 1, long: 3 },
  copy_attempt: 10,
  paste_attempt: 15,
  right_click: 2,
  text_select: 1,
  fullscreen_exit: 3,
  mouse_leave: 0.5,
  keyboard_shortcut: 5,
};

const LONG_DURATION_THRESHOLD = 5000;

const integrityService = {
  calculateIntegrityScore(integrityEvents, answerBehavior = []) {
    let score = 100;

    for (const event of integrityEvents) {
      const weight = INTEGRITY_WEIGHTS[event.type];
      if (!weight) continue;

      if (typeof weight === "object") {
        const isLong = event.duration > LONG_DURATION_THRESHOLD;
        score -= isLong ? weight.long : weight.short;
      } else {
        score -= weight;
      }
    }

    if (answerBehavior.length > 0) {
      const avgChanges =
        answerBehavior.reduce((sum, a) => sum + (a.totalChanges || 0), 0) /
        answerBehavior.length;
      if (avgChanges > 3) {
        score -= (avgChanges - 3) * 2;
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  },

  calculateBehaviorAdjustedRating(
    isCorrect,
    responseTime,
    behaviorData,
    userProfile
  ) {
    if (!isCorrect) return 1;

    const avgQuestionTime = userProfile?.averageQuestionTime || 30000;
    const timeRatio = responseTime / avgQuestionTime;

    let rating;
    if (timeRatio < 0.5) rating = 4;
    else if (timeRatio < 0.8) rating = 3;
    else rating = 2;

    if (behaviorData.answerChanges > 2) {
      rating = Math.max(2, rating - 1);
    }

    if (behaviorData.wasSkipped) {
      rating = Math.max(2, rating - 0.5);
    }

    if (behaviorData.focusScore && behaviorData.focusScore < 70) {
      rating = Math.max(2, rating - 0.5);
    }

    if (behaviorData.integrityEventCount > 0) {
      rating = Math.max(2, rating - 1);
    }

    return Math.round(rating);
  },

  detectAnomalies(sessionBehavior, userProfile) {
    const anomalies = [];

    if (!userProfile) return anomalies;

    const tabSwitches = sessionBehavior.integrityEvents.filter(
      (e) => e.type === "tab_switch"
    ).length;
    const expectedTabSwitches = userProfile.baselineTabSwitchRate || 0;
    const threshold = userProfile.anomalyThreshold || 2;

    if (tabSwitches > expectedTabSwitches * threshold + 3) {
      anomalies.push({
        type: "excessive_tab_switches",
        expected: expectedTabSwitches,
        actual: tabSwitches,
        severity: "high",
      });
    }

    const focusLosses = sessionBehavior.integrityEvents.filter(
      (e) => e.type === "focus_lost"
    ).length;
    const expectedFocusLoss = userProfile.baselineFocusLossRate || 0;

    if (focusLosses > expectedFocusLoss * threshold + 3) {
      anomalies.push({
        type: "excessive_focus_loss",
        expected: expectedFocusLoss,
        actual: focusLosses,
        severity: "medium",
      });
    }

    if (sessionBehavior.answerBehavior?.length > 0) {
      const avgChanges =
        sessionBehavior.answerBehavior.reduce((sum, a) => sum + (a.totalChanges || 0), 0) /
        sessionBehavior.answerBehavior.length;
      const expectedChanges = userProfile.typicalAnswerChangeRate || 0;

      if (avgChanges > expectedChanges * threshold + 2) {
        anomalies.push({
          type: "unusual_answer_changes",
          expected: expectedChanges,
          actual: avgChanges,
          severity: "medium",
        });
      }
    }

    return anomalies;
  },

  shouldFlagForReview(sessionBehavior, userProfile) {
    const flags = [];

    if (sessionBehavior.integrityScore < 70) {
      flags.push("Low integrity score");
    }

    const tabSwitches = sessionBehavior.integrityEvents.filter(
      (e) => e.type === "tab_switch"
    ).length;
    if (tabSwitches > 5) {
      flags.push("Excessive tab switching");
    }

    const copyPasteAttempts = sessionBehavior.integrityEvents.filter(
      (e) => e.type === "copy_attempt" || e.type === "paste_attempt"
    ).length;
    if (copyPasteAttempts > 0) {
      flags.push("Copy/paste attempts detected");
    }

    const longTabSwitches = sessionBehavior.integrityEvents.filter(
      (e) => e.type === "tab_switch" && e.duration > 30000
    ).length;
    if (longTabSwitches > 0) {
      flags.push("Extended time away from quiz");
    }

    const anomalies = this.detectAnomalies(sessionBehavior, userProfile);
    const highSeverityAnomalies = anomalies.filter((a) => a.severity === "high");
    if (highSeverityAnomalies.length > 0) {
      flags.push("Behavioral anomaly detected");
    }

    return {
      shouldFlag: flags.length > 0,
      reasons: flags,
      anomalies,
    };
  },

  async processQuizCompletion(quizAttemptId) {
    const sessionBehavior = await QuizSessionBehavior.findOne({ quizAttemptId });
    if (!sessionBehavior) return null;

    const userProfile = await UserBehaviorProfile.findOne({
      userId: sessionBehavior.userId,
    });

    sessionBehavior.calculateAllScores();

    const flagResult = this.shouldFlagForReview(sessionBehavior, userProfile);
    sessionBehavior.flaggedForReview = flagResult.shouldFlag;
    sessionBehavior.flagReasons = flagResult.reasons;

    await sessionBehavior.save();

    if (userProfile) {
      await userProfile.updateFromSession(sessionBehavior);
    }

    return {
      sessionBehavior,
      flagResult,
      scores: {
        integrity: sessionBehavior.integrityScore,
        engagement: sessionBehavior.engagementScore,
        focus: sessionBehavior.focusScore,
        confidence: sessionBehavior.confidenceScore,
      },
    };
  },

  async getRatingForQuestion(userId, questionId, isCorrect, responseTime, behaviorData) {
    const userProfile = await UserBehaviorProfile.findOne({ userId });

    return this.calculateBehaviorAdjustedRating(
      isCorrect,
      responseTime,
      behaviorData,
      userProfile
    );
  },
};

export default integrityService;
