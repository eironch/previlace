import { useState, useEffect, useCallback, useRef } from "react";
import useAdaptiveStore from "@/store/adaptiveStore";
import useQuizProctoring from "./useQuizProctoring";

function useAdaptiveSession(quizAttemptId, options = {}) {
  const {
    enabled = true,
    topicIds = [],
    examLevel = "Professional",
    questionCount = 20,
    mode = "practice",
    checkInterval = 5,
  } = options;

  const store = useAdaptiveStore();
  const lastCheckRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const proctoring = useQuizProctoring(quizAttemptId, {
    enabled,
    trackTabSwitch: true,
    trackFocusLoss: true,
    trackCopyPaste: true,
    trackRightClick: true,
    trackTextSelection: true,
    trackMouseLeave: true,
    trackKeyboardShortcuts: true,
  });

  useEffect(() => {
    if (!enabled) {
      setIsInitialized(true);
      return;
    }

    async function init() {
      await store.loadConfig({ questionCount, examLevel, topicIds, mode });
      await store.loadSessionRecommendations();
      setIsInitialized(true);
    }

    init();

    return () => {
      store.reset();
      proctoring.resetTracking();
    };
  }, [enabled]);

  const recordAnswer = useCallback(
    (isCorrect, timeSpent) => {
      store.recordAnswer(isCorrect, timeSpent);
      const questionNum = store.questionsAnswered + 1;

      if (quizAttemptId && questionNum % checkInterval === 0) {
        const behaviorSummary = proctoring.getBehaviorSummary();
        const currentBehavior = {
          questionsAnswered: questionNum,
          correctAnswers: store.correctAnswers + (isCorrect ? 1 : 0),
          recentIntegrityEvents: behaviorSummary.events.slice(-10),
          currentFocusScore: calculateFocusScore(behaviorSummary),
          totalTimeSpent: store.totalTimeSpent + timeSpent,
        };
        store.checkMidQuizAdjustments(quizAttemptId, currentBehavior);
      }

      const breakInterval = store.getBreakInterval();
      if (breakInterval && questionNum > 0 && questionNum % breakInterval === 0) {
        store.triggerBreakReminder();
      }
    },
    [quizAttemptId, checkInterval, proctoring]
  );

  function calculateFocusScore(behaviorSummary) {
    const { eventCounts } = behaviorSummary;
    let score = 100;
    score -= (eventCounts.tabSwitch || 0) * 5;
    score -= (eventCounts.focusLost || 0) * 3;
    score -= (eventCounts.copyAttempt || 0) * 10;
    score -= (eventCounts.mouseLeave || 0) * 1;
    return Math.max(0, Math.min(100, score));
  }

  const dismissSuggestion = useCallback((type) => {
    store.dismissSuggestion(type);
  }, []);

  const dismissBreak = useCallback(() => {
    store.dismissBreakReminder();
  }, []);

  const handleSuggestionAction = useCallback((type, action) => {
    if (type === "break_suggestion" && action === "take_break") {
      store.dismissBreakReminder();
    }
    store.dismissSuggestion(type);
  }, []);

  const getSessionStats = useCallback(() => {
    return {
      questionsAnswered: store.questionsAnswered,
      correctAnswers: store.correctAnswers,
      accuracy: store.getAccuracy(),
      totalTime: store.totalTimeSpent,
      currentDifficulty: store.currentDifficulty,
      integrityScore: proctoring.integrityScore,
    };
  }, [proctoring.integrityScore]);

  const reset = useCallback(() => {
    store.reset();
    proctoring.resetTracking();
    setIsInitialized(false);
  }, [proctoring]);

  return {
    isInitialized,
    isLoadingConfig: store.isLoadingConfig,
    config: store.config,
    suggestions: store.suggestions,
    behaviorMetrics: store.behaviorMetrics,
    sessionRecommendations: store.sessionRecommendations,
    currentDifficulty: store.currentDifficulty,
    difficultyHistory: store.difficultyHistory,
    showBreakReminder: store.showBreakReminder,
    proctoring,
    recordAnswer,
    dismissSuggestion,
    dismissBreak,
    handleSuggestionAction,
    getSessionStats,
    reset,
    error: store.error,
  };
}

export default useAdaptiveSession;
