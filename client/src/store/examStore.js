import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/services/apiClient";
import useQuestionCacheStore from "./questionCacheStore";

const useExamStore = create(
  persist(
    (set, get) => ({
      currentSession: null,
      questions: [],
      sessionQuestions: [],
      currentQuestionIndex: 0,
      answers: {},
      currentResult: null,
      loading: false,
      error: null,
      timeRemaining: 0,
      sessionActive: false,
      isPaused: false,
      currentFeedback: null,
      hasImmediateFeedback: false,
      hasTimer: false,
      pendingAnswer: null,
      isConfirmingAnswer: false,
      showingFeedback: false,
      questionTimings: {},

      startQuizAttempt: async (config) => {
        try {
          set({ loading: true, error: null });

          let endpoint = "/exam/start";
          let payload = config;

          if (config.mode === "subject" && config.subjectId) {
            endpoint = "/exam/subject-quiz";
            payload = {
              subjectId: config.subjectId,
              examLevel: config.examLevel,
              questionCount: config.questionCount,
            };
          } else if (config.mode === "topic" && config.topicId) {
            endpoint = "/exam/topic-quiz";
            payload = {
              topicId: config.topicId,
              examLevel: config.examLevel,
              questionCount: config.questionCount,
            };
          } else if (config.mode === "assessment") {
            endpoint = "/exam/assessment";
            payload = {
              currentWeekNumber: config.currentWeekNumber,
            };
          } else if (config.mode === "post-test") {
            endpoint = "/exam/post-test";
            payload = {
              weekNumber: config.weekNumber,
            };
          }

          const response = await apiClient.post(endpoint, payload);

          if (!response.data.success) {
            throw new Error(response.data.message || "Failed to start quiz");
          }

          const sessionData = response.data.data;

          if (!sessionData?.questions || sessionData.questions.length === 0) {
            throw new Error("No questions available. Please try again later.");
          }

          // Handle resumed answers if any
          const resumedAnswers = {};
          if (sessionData.session.answers && sessionData.session.answers.length > 0) {
            sessionData.session.answers.forEach((ans) => {
              resumedAnswers[ans.questionId] = {
                answer: ans.userAnswer,
                timeSpent: ans.timeSpent,
                isCorrect: ans.isCorrect,
                feedback: ans.feedback, // If backend provides it
              };
            });
          }

          // Calculate index based on answered questions
          const nextIndex = Object.keys(resumedAnswers).length;

          set({
            currentSession: sessionData.session,
            sessionQuestions: sessionData.questions,
            questions: sessionData.questions,
            currentQuestionIndex: Math.min(nextIndex, sessionData.questions.length - 1),
            answers: resumedAnswers,
            timeRemaining: sessionData.session.timeLimit || 0,
            sessionActive: true,
            isPaused: false,
            loading: false,
            error: null,
            hasImmediateFeedback: sessionData.session.hasImmediateFeedback || false,
            hasTimer: sessionData.session.hasTimer || false,
            currentFeedback: null,
            pendingAnswer: null,
            isConfirmingAnswer: false,
            showingFeedback: false,
          });
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("Start quiz session error:", err);
          }
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      startMockExam: async (examLevel) => {
        try {
          set({ loading: true, error: null });

          const response = await apiClient.post("/exam/mock-exam", {
            examLevel: examLevel || "professional",
          });

          if (!response.data.success) {
            throw new Error(response.data.message || "Failed to start mock exam");
          }

          const sessionData = response.data.data;

          if (!sessionData?.questions || sessionData.questions.length === 0) {
            throw new Error("No questions available. Please try again later.");
          }

          set({
            currentSession: sessionData.session,
            sessionQuestions: sessionData.questions,
            questions: sessionData.questions,
            currentQuestionIndex: 0,
            answers: {},
            timeRemaining: sessionData.session.timeLimit || 7200,
            sessionActive: true,
            isPaused: false,
            loading: false,
            error: null,
            hasImmediateFeedback: false,
            hasTimer: true,
            currentFeedback: null,
            pendingAnswer: null,
            isConfirmingAnswer: false,
            showingFeedback: false,
          });
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("Start mock exam error:", err);
          }
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      startDailyPractice: async () => {
        try {
          set({ loading: true, error: null });

          const response = await apiClient.post("/exam/daily-practice");

          if (!response.data.success) {
            throw new Error(response.data.message || "Failed to start daily practice");
          }

          const sessionData = response.data.data;

          if (!sessionData?.questions || sessionData.questions.length === 0) {
            throw new Error("No questions available for daily practice.");
          }

          // Handle resumed answers if any
          const resumedAnswers = {};
          if (sessionData.session.answers && sessionData.session.answers.length > 0) {
            sessionData.session.answers.forEach((ans) => {
              resumedAnswers[ans.questionId] = {
                answer: ans.userAnswer,
                timeSpent: ans.timeSpent,
                isCorrect: ans.isCorrect,
                feedback: ans.feedback,
              };
            });
          }

          const nextIndex = Object.keys(resumedAnswers).length;

          set({
            currentSession: sessionData.session,
            sessionQuestions: sessionData.questions,
            questions: sessionData.questions,
            currentQuestionIndex: Math.min(nextIndex, sessionData.questions.length - 1),
            answers: resumedAnswers,
            timeRemaining: 0,
            sessionActive: true,
            isPaused: false,
            loading: false,
            error: null,
            hasImmediateFeedback: true,
            hasTimer: false,
            currentFeedback: null,
            pendingAnswer: null,
            isConfirmingAnswer: false,
            showingFeedback: false,
          });
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("Start daily practice error:", err);
          }
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      getCurrentQuestion: () => {
        const { sessionQuestions, currentQuestionIndex } = get();
        return sessionQuestions[currentQuestionIndex] || null;
      },

      navigateToQuestion: (index) => {
        const state = get();
        if (index < 0 || index >= state.sessionQuestions.length) return;

        const targetQuestion = state.sessionQuestions[index];
        const targetAnswer = state.answers[targetQuestion._id];

        if (targetAnswer && targetAnswer.feedback && state.hasImmediateFeedback) {
          set({
            currentQuestionIndex: index,
            showingFeedback: true,
            currentFeedback: targetAnswer.feedback,
            pendingAnswer: null,
          });
          return;
        }

        set({
          currentQuestionIndex: index,
          showingFeedback: false,
          currentFeedback: null,
          pendingAnswer: targetAnswer?.answer || null,
        });
      },

      setCurrentQuestionIndex: (index) => {
        const { navigateToQuestion } = get();
        navigateToQuestion(index);
      },

      nextQuestion: () => {
        const state = get();
        
        const nextIndex = state.currentQuestionIndex + 1;
        if (nextIndex >= state.sessionQuestions.length) return;

        get().navigateToQuestion(nextIndex);
      },

      previousQuestion: () => {
        const state = get();

        if (state.showingFeedback) {
          const currentQuestion = state.sessionQuestions[state.currentQuestionIndex];
          const isCurrentAnswered = !!state.answers[currentQuestion._id];

          if (isCurrentAnswered) {
            const prevIndex = state.currentQuestionIndex - 1;
            if (prevIndex < 0) return;
            get().navigateToQuestion(prevIndex);
            return;
          }

          set({
            showingFeedback: false,
            currentFeedback: null,
          });
          return;
        }

        const prevIndex = state.currentQuestionIndex - 1;
        if (prevIndex < 0) return;

        get().navigateToQuestion(prevIndex);
      },

      updateTimer: (time) => set({ timeRemaining: time }),

      setSessionActive: (active) => set({ sessionActive: active }),

      goToNextQuestion: () =>
        set((state) => {
          const nextIndex = state.currentQuestionIndex + 1;
          if (nextIndex < state.sessionQuestions.length) {
            return {
              currentQuestionIndex: nextIndex,
              showingFeedback: false,
              currentFeedback: null,
              pendingAnswer: null,
            };
          }
          return state;
        }),

      pauseSession: () =>
        set((state) => ({
          isPaused: true,
          sessionActive: false,
          currentSession: state.currentSession
            ? { ...state.currentSession, status: "paused" }
            : null,
        })),

      resumeSession: () =>
        set((state) => ({
          isPaused: false,
          sessionActive: true,
          currentSession: state.currentSession
            ? { ...state.currentSession, status: "active" }
            : null,
        })),

      setPendingAnswer: (answer) => set({ pendingAnswer: answer }),

      selectAnswer: (questionId, answer) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: { answer, timeSpent: 0 },
          },
          pendingAnswer: null,
        }));
      },

      confirmAnswer: async () => {
        const {
          currentSession,
          hasImmediateFeedback,
          sessionQuestions,
          currentQuestionIndex,
          pendingAnswer,
        } = get();

        if (!pendingAnswer) return null;

        const currentQuestion = sessionQuestions[currentQuestionIndex];
        const questionId = currentQuestion._id;

        set({ isConfirmingAnswer: true });

        if (hasImmediateFeedback && currentSession) {
          // Local Validation Optimization
          if (currentQuestion.correctAnswer) {
            const isCorrect = pendingAnswer === currentQuestion.correctAnswer;
            const feedback = {
              isCorrect,
              correctAnswer: currentQuestion.correctAnswer,
              explanation: currentQuestion.explanation,
              explanationMath: currentQuestion.explanationMath,
            };

            // Update state immediately
            set((state) => ({
              answers: {
                ...state.answers,
                [questionId]: { answer: pendingAnswer, timeSpent: 0, feedback, isCorrect },
              },
              currentFeedback: feedback,
              isConfirmingAnswer: false,
              showingFeedback: true,
              pendingAnswer: null,
            }));

            // Sync with backend in background
            try {
              apiClient.post(`/exam/${currentSession._id}/answer`, {
                questionId,
                answer: pendingAnswer,
                timeSpent: 0,
                topicId: currentQuestion?.topicId,
                topicName: currentQuestion?.topicName,
              });
            } catch (error) {
              console.error("Background sync failed:", error);
            }

            return feedback;
          }

          // Fallback to server validation if no local answer data
          try {
            const response = await apiClient.post(
              `/exam/${currentSession._id}/answer`,
              {
                questionId,
                answer: pendingAnswer,
                timeSpent: 0,
                topicId: currentQuestion?.topicId,
                topicName: currentQuestion?.topicName,
              }
            );

            if (response.data.success && response.data.data.feedback) {
              const feedback = response.data.data.feedback;
              set((state) => ({
                answers: {
                  ...state.answers,
                  [questionId]: { answer: pendingAnswer, timeSpent: 0, feedback },
                },
                currentFeedback: feedback,
                isConfirmingAnswer: false,
                showingFeedback: true,
                pendingAnswer: null,
              }));
              return feedback;
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to get immediate feedback:", error);
            }
            set({ isConfirmingAnswer: false });
          }
        } else {
          set((state) => ({
            answers: {
              ...state.answers,
              [questionId]: { answer: pendingAnswer, timeSpent: 0 },
            },
            isConfirmingAnswer: false,
            pendingAnswer: null,
          }));
        }

        set({ isConfirmingAnswer: false });
        return null;
      },

      updateAnswer: async (questionId, answer) => {
        const { currentSession, hasImmediateFeedback, sessionQuestions } = get();

        const question = sessionQuestions.find((q) => q._id === questionId);

        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: answer,
          },
          currentFeedback: null,
        }));

        if (hasImmediateFeedback && currentSession) {
          try {
            const response = await apiClient.post(
              `/exam/${currentSession._id}/answer`,
              {
                questionId,
                answer: answer.answer || answer,
                timeSpent: answer.timeSpent || 0,
                topicId: question?.topicId,
                topicName: question?.topicName,
              }
            );

            if (response.data.success && response.data.data.feedback) {
              set({ currentFeedback: response.data.data.feedback });
              return response.data.data.feedback;
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to get immediate feedback:", error);
            }
          }
        }
        return null;
      },

      completeSession: async () => {
        set({ loading: true });
        try {
          const {
            currentSession,
            answers,
            sessionQuestions,
            hasImmediateFeedback,
          } = get();

          if (!currentSession) {
            throw new Error("No active session");
          }

          if (!hasImmediateFeedback) {
            const answersToSubmit = Object.entries(answers);

            for (const [questionId, answerData] of answersToSubmit) {
              const question = sessionQuestions.find((q) => q._id === questionId);
              try {
                await apiClient.post(`/exam/${currentSession._id}/answer`, {
                  questionId,
                  answer: answerData.answer || "",
                  timeSpent: answerData.timeSpent || 0,
                  topicId: question?.topicId,
                  topicName: question?.topicName,
                });
              } catch (error) {
                if (process.env.NODE_ENV === "development") {
                  console.error(
                    `Failed to submit answer for question ${questionId}:`,
                    error
                  );
                }
              }
            }

            const unansweredQuestionIds = sessionQuestions
              .map((q) => q._id)
              .filter((id) => !answers[id]);

            for (const questionId of unansweredQuestionIds) {
              const question = sessionQuestions.find((q) => q._id === questionId);
              try {
                await apiClient.post(`/exam/${currentSession._id}/answer`, {
                  questionId,
                  answer: "",
                  timeSpent: 0,
                  topicId: question?.topicId,
                  topicName: question?.topicName,
                });
              } catch (error) {
                if (process.env.NODE_ENV === "development") {
                  console.error(
                    `Failed to submit unanswered question ${questionId}:`,
                    error
                  );
                }
              }
            }
          }

          const response = await apiClient.post(
            `/exam/${currentSession._id}/complete`
          );

          set({
            currentResult: response.data.data.result,
            loading: false,
            sessionActive: false,
            // Clear persisted state on completion
            currentSession: null,
            questions: [],
            sessionQuestions: [],
            answers: {},
            currentQuestionIndex: 0,
          });
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Session completion error:", error);
          }
          set({ loading: false, sessionActive: false, error: error.message });
          throw error;
        }
      },

      trackQuestionTime: (questionId, timeSpent) => {
        set((state) => ({
          questionTimings: {
            ...state.questionTimings,
            [questionId]: (state.questionTimings[questionId] || 0) + timeSpent,
          },
        }));
      },

      clearFeedback: () =>
        set({
          currentFeedback: null,
          pendingAnswer: null,
          showingFeedback: false,
        }),

      resetSession: () =>
        set({
          currentSession: null,
          questions: [],
          sessionQuestions: [],
          currentQuestionIndex: 0,
          answers: {},
          currentResult: null,
          error: null,
          timeRemaining: 0,
          sessionActive: false,
          isPaused: false,
          currentFeedback: null,
          hasImmediateFeedback: false,
          hasTimer: false,
          pendingAnswer: null,
          isConfirmingAnswer: false,
          showingFeedback: false,
          questionTimings: {},
        }),
    }),
    {
      name: "exam-storage", // unique name for local storage
      partialize: (state) => ({
        currentSession: state.currentSession,
        questions: state.questions,
        sessionQuestions: state.sessionQuestions,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        timeRemaining: state.timeRemaining,
        sessionActive: state.sessionActive,
        isPaused: state.isPaused,
        hasImmediateFeedback: state.hasImmediateFeedback,
        hasTimer: state.hasTimer,
        questionTimings: state.questionTimings,
      }),
    }
  )
);

export default useExamStore;
