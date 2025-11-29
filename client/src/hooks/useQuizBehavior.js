import { useCallback, useRef, useEffect } from "react";
import useQuizProctoring from "./useQuizProctoring";
import useActivityTracker from "./useActivityTracker";
import useAnswerTracking from "./useAnswerTracking";
import { captureQuizEvent, getSessionId } from "@/lib/posthog";
import behaviorAnalyticsService from "@/services/behaviorAnalyticsService";

function useQuizBehavior(quizAttemptId, options = {}) {
  const {
    enabled = true,
    autoSave = true,
    saveInterval = 30000,
    onBehaviorUpdate = null,
  } = options;

  const lastSaveRef = useRef(Date.now());
  const saveTimerRef = useRef(null);

  const proctoring = useQuizProctoring(quizAttemptId, {
    enabled,
    onIntegrityEvent: (event) => {
      if (onBehaviorUpdate) {
        onBehaviorUpdate({ type: "integrity", event });
      }
    },
  });

  const activity = useActivityTracker({
    enabled,
    idleTimeout: 60000,
    engagementInterval: 5000,
  });

  const answerTracking = useAnswerTracking(quizAttemptId);

  const collectBehaviorData = useCallback(() => {
    const proctoringData = proctoring.getBehaviorSummary();
    const activityData = activity.getActivitySummary();
    const answerData = answerTracking.getAnswerTrackingSummary();

    return {
      totalDuration: activityData.sessionDuration,
      activeTime: activityData.totalActiveTime,
      idleTime: activityData.totalIdleTime,
      questionTimings: Object.entries(answerData.questionTimings).map(([questionId, timing]) => ({
        questionId,
        totalTime: timing.totalTime || 0,
        firstViewedAt: answerData.questionVisits[questionId]?.firstVisitAt,
        answeredAt: timing.lastTimeSpent ? new Date() : null,
        revisitCount: answerData.questionVisits[questionId]?.visitCount || 0,
      })),
      integrityEvents: proctoringData.events.map((e) => ({
        type: e.type,
        timestamp: e.timestamp,
        duration: e.duration,
        questionId: e.questionId,
        metadata: e.metadata,
      })),
      answerBehavior: Object.entries(answerData.answerChanges).map(([questionId, data]) => ({
        questionId,
        changeHistory: data.changes || [],
        totalChanges: data.changeCount || 0,
        firstAnswer: data.firstAnswer,
        finalAnswer: data.finalAnswer,
        wasSkipped: answerData.skippedQuestions.includes(questionId),
        wasRevisited: (answerData.questionVisits[questionId]?.visitCount || 0) > 1,
      })),
      integrityScore: proctoringData.integrityScore,
      engagementScore: activityData.engagementScore,
      focusScore: proctoringData.integrityScore,
      confidenceScore: calculateConfidenceScore(answerData),
      posthogSessionId: getSessionId(),
    };
  }, [proctoring, activity, answerTracking]);

  const calculateConfidenceScore = useCallback((answerData) => {
    if (!answerData?.summary) return 100;
    const { averageChangesPerQuestion, skippedCount, questionsTracked } = answerData.summary;

    let score = 100;
    score -= averageChangesPerQuestion * 10;
    if (questionsTracked > 0) {
      score -= (skippedCount / questionsTracked) * 20;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  }, []);

  const saveBehavior = useCallback(async () => {
    if (!enabled || !quizAttemptId) return;

    try {
      const behaviorData = collectBehaviorData();
      await behaviorAnalyticsService.saveQuizBehavior(quizAttemptId, behaviorData);
      lastSaveRef.current = Date.now();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving behavior:", error);
      }
    }
  }, [enabled, quizAttemptId, collectBehaviorData]);

  useEffect(() => {
    if (!autoSave || !enabled) return;

    saveTimerRef.current = setInterval(() => {
      saveBehavior();
    }, saveInterval);

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [autoSave, enabled, saveInterval, saveBehavior]);

  const startQuiz = useCallback(() => {
    captureQuizEvent("quiz_started", {
      quiz_attempt_id: quizAttemptId,
      session_id: getSessionId(),
    });
  }, [quizAttemptId]);

  const endQuiz = useCallback(async (score, totalQuestions) => {
    const behaviorData = collectBehaviorData();

    captureQuizEvent("quiz_completed", {
      quiz_attempt_id: quizAttemptId,
      score,
      total_questions: totalQuestions,
      duration: behaviorData.totalDuration,
      integrity_score: behaviorData.integrityScore,
      engagement_score: behaviorData.engagementScore,
      session_id: getSessionId(),
    });

    await saveBehavior();

    return behaviorData;
  }, [quizAttemptId, collectBehaviorData, saveBehavior]);

  const onQuestionChange = useCallback((questionId, previousQuestionId) => {
    if (previousQuestionId) {
      answerTracking.stopQuestionTimer(previousQuestionId);
    }

    answerTracking.startQuestionTimer(questionId);
    proctoring.setQuestion(questionId);

    const visits = answerTracking.questionVisits[questionId];
    if (visits?.visitCount > 1) {
      answerTracking.recordRevisit(questionId);
    }
  }, [answerTracking, proctoring]);

  const onAnswerSelect = useCallback((questionId, previousAnswer, newAnswer) => {
    if (previousAnswer !== undefined && previousAnswer !== newAnswer) {
      answerTracking.recordAnswerChange(questionId, previousAnswer, newAnswer);
    }
  }, [answerTracking]);

  const onQuestionSkip = useCallback((questionId) => {
    answerTracking.recordSkip(questionId);
  }, [answerTracking]);

  const resetAll = useCallback(() => {
    proctoring.resetTracking();
    activity.resetTracking();
    answerTracking.resetTracking();
  }, [proctoring, activity, answerTracking]);

  return {
    proctoring: {
      integrityScore: proctoring.integrityScore,
      integrityEvents: proctoring.integrityEvents,
      isDocumentVisible: proctoring.isDocumentVisible,
      isWindowFocused: proctoring.isWindowFocused,
      getEventCounts: proctoring.getEventCounts,
    },
    activity: {
      isIdle: activity.isIdle,
      engagementScore: activity.engagementScore,
      totalActiveTime: activity.totalActiveTime,
      getSessionDuration: activity.getSessionDuration,
    },
    answers: {
      questionTimings: answerTracking.questionTimings,
      answerChanges: answerTracking.answerChanges,
      getSummary: answerTracking.getAnswerTrackingSummary,
    },
    startQuiz,
    endQuiz,
    onQuestionChange,
    onAnswerSelect,
    onQuestionSkip,
    saveBehavior,
    collectBehaviorData,
    resetAll,
  };
}

export default useQuizBehavior;
