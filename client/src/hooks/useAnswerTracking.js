import { useState, useCallback, useRef } from "react";
import { captureQuizEvent, getSessionId } from "@/lib/posthog";

function useAnswerTracking(quizAttemptId) {
  const [questionTimings, setQuestionTimings] = useState({});
  const [answerChanges, setAnswerChanges] = useState({});
  const [questionVisits, setQuestionVisits] = useState({});
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());

  const questionStartTimeRef = useRef({});
  const currentQuestionRef = useRef(null);

  const startQuestionTimer = useCallback((questionId) => {
    const now = Date.now();
    questionStartTimeRef.current[questionId] = now;
    currentQuestionRef.current = questionId;

    setQuestionVisits((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        visitCount: (prev[questionId]?.visitCount || 0) + 1,
        firstVisitAt: prev[questionId]?.firstVisitAt || now,
        lastVisitAt: now,
      },
    }));
  }, []);

  const stopQuestionTimer = useCallback((questionId) => {
    const startTime = questionStartTimeRef.current[questionId];
    if (!startTime) return 0;

    const timeSpent = Date.now() - startTime;
    delete questionStartTimeRef.current[questionId];

    setQuestionTimings((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        totalTime: (prev[questionId]?.totalTime || 0) + timeSpent,
        lastTimeSpent: timeSpent,
      },
    }));

    return timeSpent;
  }, []);

  const recordAnswerChange = useCallback(
    (questionId, fromAnswer, toAnswer) => {
      if (fromAnswer === toAnswer) return;

      const change = {
        from: fromAnswer,
        to: toAnswer,
        timestamp: Date.now(),
      };

      setAnswerChanges((prev) => ({
        ...prev,
        [questionId]: {
          changes: [...(prev[questionId]?.changes || []), change],
          changeCount: (prev[questionId]?.changeCount || 0) + 1,
          firstAnswer: prev[questionId]?.firstAnswer ?? fromAnswer,
          finalAnswer: toAnswer,
        },
      }));

      captureQuizEvent("answer_changed", {
        quiz_attempt_id: quizAttemptId,
        question_id: questionId,
        change_count: (answerChanges[questionId]?.changeCount || 0) + 1,
        session_id: getSessionId(),
      });
    },
    [quizAttemptId, answerChanges]
  );

  const recordSkip = useCallback(
    (questionId) => {
      setSkippedQuestions((prev) => new Set([...prev, questionId]));

      captureQuizEvent("question_skipped", {
        quiz_attempt_id: quizAttemptId,
        question_id: questionId,
        time_on_question: questionTimings[questionId]?.totalTime || 0,
        session_id: getSessionId(),
      });
    },
    [quizAttemptId, questionTimings]
  );

  const recordRevisit = useCallback(
    (questionId) => {
      const wasSkipped = skippedQuestions.has(questionId);
      const visits = questionVisits[questionId];

      if (visits?.visitCount > 1) {
        captureQuizEvent("question_revisited", {
          quiz_attempt_id: quizAttemptId,
          question_id: questionId,
          visit_count: visits.visitCount,
          was_skipped: wasSkipped,
          time_since_first: Date.now() - (visits.firstVisitAt || Date.now()),
          session_id: getSessionId(),
        });
      }
    },
    [quizAttemptId, questionVisits, skippedQuestions]
  );

  const getQuestionBehavior = useCallback(
    (questionId) => {
      return {
        timing: questionTimings[questionId] || { totalTime: 0, lastTimeSpent: 0 },
        changes: answerChanges[questionId] || { changes: [], changeCount: 0 },
        visits: questionVisits[questionId] || { visitCount: 0 },
        wasSkipped: skippedQuestions.has(questionId),
      };
    },
    [questionTimings, answerChanges, questionVisits, skippedQuestions]
  );

  const getAnswerTrackingSummary = useCallback(() => {
    const questionIds = Object.keys(questionTimings);
    const totalTime = Object.values(questionTimings).reduce(
      (sum, t) => sum + (t.totalTime || 0),
      0
    );
    const avgTime = questionIds.length > 0 ? totalTime / questionIds.length : 0;
    const totalChanges = Object.values(answerChanges).reduce(
      (sum, a) => sum + (a.changeCount || 0),
      0
    );
    const avgChanges = questionIds.length > 0 ? totalChanges / questionIds.length : 0;
    const revisitedCount = Object.values(questionVisits).filter(
      (v) => v.visitCount > 1
    ).length;

    return {
      questionTimings,
      answerChanges,
      questionVisits,
      skippedQuestions: Array.from(skippedQuestions),
      summary: {
        totalTimeSpent: totalTime,
        averageTimePerQuestion: Math.round(avgTime),
        totalAnswerChanges: totalChanges,
        averageChangesPerQuestion: Math.round(avgChanges * 100) / 100,
        skippedCount: skippedQuestions.size,
        revisitedCount,
        questionsTracked: questionIds.length,
      },
    };
  }, [questionTimings, answerChanges, questionVisits, skippedQuestions]);

  const resetTracking = useCallback(() => {
    setQuestionTimings({});
    setAnswerChanges({});
    setQuestionVisits({});
    setSkippedQuestions(new Set());
    questionStartTimeRef.current = {};
    currentQuestionRef.current = null;
  }, []);

  return {
    startQuestionTimer,
    stopQuestionTimer,
    recordAnswerChange,
    recordSkip,
    recordRevisit,
    getQuestionBehavior,
    getAnswerTrackingSummary,
    resetTracking,
    questionTimings,
    answerChanges,
  };
}

export default useAnswerTracking;
