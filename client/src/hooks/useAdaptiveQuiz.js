import { useState, useEffect, useCallback, useRef } from "react";
import adaptivityService from "@/services/adaptivityService";
import useQuizProctoring from "./useQuizProctoring";

function useAdaptiveQuiz(quizAttemptId, options = {}) {
  const {
    enabled = true,
    topicIds = [],
    examLevel = "Professional",
    questionCount = 20,
    mode = "practice",
    onConfigLoaded = null,
    checkAdjustmentsInterval = 300000,
  } = options;

  const [adaptiveConfig, setAdaptiveConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);
  const [midQuizSuggestions, setMidQuizSuggestions] = useState([]);
  const [behaviorMetrics, setBehaviorMetrics] = useState(null);

  const questionsAnsweredRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const totalTimeRef = useRef(0);
  const lastAdjustmentCheckRef = useRef(Date.now());

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
      setIsLoadingConfig(false);
      return;
    }

    async function loadAdaptiveConfig() {
      setIsLoadingConfig(true);
      setConfigError(null);

      try {
        const response = await adaptivityService.getAdaptedQuizConfig({
          questionCount,
          examLevel,
          topicIds,
          mode,
        });

        if (response.success) {
          setAdaptiveConfig(response.data);
          if (onConfigLoaded) {
            onConfigLoaded(response.data);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load adaptive config:", error);
        }
        setConfigError(error.message || "Failed to load adaptive configuration");
      } finally {
        setIsLoadingConfig(false);
      }
    }

    loadAdaptiveConfig();
  }, [enabled, questionCount, examLevel, mode]);

  const checkForAdjustments = useCallback(async () => {
    if (!quizAttemptId || !enabled) return;

    const now = Date.now();
    if (now - lastAdjustmentCheckRef.current < checkAdjustmentsInterval) {
      return;
    }

    lastAdjustmentCheckRef.current = now;

    try {
      const behaviorSummary = proctoring.getBehaviorSummary();
      const currentBehavior = {
        questionsAnswered: questionsAnsweredRef.current,
        correctAnswers: correctAnswersRef.current,
        recentIntegrityEvents: behaviorSummary.events.slice(-10),
        currentFocusScore: calculateCurrentFocusScore(behaviorSummary),
        totalTimeSpent: totalTimeRef.current,
      };

      const response = await adaptivityService.getMidQuizAdjustments(
        quizAttemptId,
        currentBehavior
      );

      if (response.success && response.data) {
        setMidQuizSuggestions(response.data.suggestions || []);
        setBehaviorMetrics(response.data.metrics || null);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to check adjustments:", error);
      }
    }
  }, [quizAttemptId, enabled, proctoring, checkAdjustmentsInterval]);

  function calculateCurrentFocusScore(behaviorSummary) {
    const { eventCounts } = behaviorSummary;
    let score = 100;

    score -= (eventCounts.tabSwitch || 0) * 5;
    score -= (eventCounts.focusLost || 0) * 3;
    score -= (eventCounts.copyAttempt || 0) * 10;
    score -= (eventCounts.mouseLeave || 0) * 1;

    return Math.max(0, Math.min(100, score));
  }

  const recordAnswer = useCallback((isCorrect, timeSpent) => {
    questionsAnsweredRef.current += 1;
    if (isCorrect) correctAnswersRef.current += 1;
    totalTimeRef.current += timeSpent;

    if (questionsAnsweredRef.current % 5 === 0) {
      checkForAdjustments();
    }
  }, [checkForAdjustments]);

  const dismissSuggestion = useCallback((suggestionType) => {
    setMidQuizSuggestions((prev) =>
      prev.filter((s) => s.type !== suggestionType)
    );
  }, []);

  const submitFeedback = useCallback(async (feedbackData) => {
    if (!quizAttemptId) return;

    try {
      await adaptivityService.recordBehaviorFeedback(quizAttemptId, feedbackData);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to submit feedback:", error);
      }
    }
  }, [quizAttemptId]);

  const getAdaptedQuestionOrder = useCallback(() => {
    if (!adaptiveConfig?.prioritizedQuestionIds) return null;
    return adaptiveConfig.prioritizedQuestionIds;
  }, [adaptiveConfig]);

  const shouldShowHints = useCallback(() => {
    return adaptiveConfig?.config?.showHints || false;
  }, [adaptiveConfig]);

  const getBreakSuggestionInterval = useCallback(() => {
    return adaptiveConfig?.config?.breakSuggestionInterval || null;
  }, [adaptiveConfig]);

  const getDifficultyBias = useCallback(() => {
    return adaptiveConfig?.config?.difficultyBias || "intermediate";
  }, [adaptiveConfig]);

  const reset = useCallback(() => {
    questionsAnsweredRef.current = 0;
    correctAnswersRef.current = 0;
    totalTimeRef.current = 0;
    lastAdjustmentCheckRef.current = Date.now();
    setMidQuizSuggestions([]);
    setBehaviorMetrics(null);
    proctoring.resetTracking();
  }, [proctoring]);

  return {
    adaptiveConfig,
    isLoadingConfig,
    configError,
    midQuizSuggestions,
    behaviorMetrics,
    proctoring,
    recordAnswer,
    dismissSuggestion,
    submitFeedback,
    checkForAdjustments,
    getAdaptedQuestionOrder,
    shouldShowHints,
    getBreakSuggestionInterval,
    getDifficultyBias,
    reset,
    currentStats: {
      questionsAnswered: questionsAnsweredRef.current,
      correctAnswers: correctAnswersRef.current,
      totalTime: totalTimeRef.current,
      accuracy: questionsAnsweredRef.current > 0
        ? (correctAnswersRef.current / questionsAnsweredRef.current) * 100
        : 0,
    },
  };
}

export default useAdaptiveQuiz;
