import { create } from "zustand";
import apiClient from "@/services/apiClient";

const useExamStore = create((set, get) => ({
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

  startQuizSession: async (config) => {
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
      }

      const response = await apiClient.post(endpoint, payload);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to start quiz");
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
        timeRemaining: sessionData.session.timeLimit || config.timeLimit || 600,
        sessionActive: true,
        isPaused: false,
        loading: false,
        error: null,
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Start quiz session error:", err);
      }
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  getCurrentQuestion: () => {
    const { sessionQuestions, currentQuestionIndex } = get();
    return sessionQuestions[currentQuestionIndex] || null;
  },

  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

  nextQuestion: () =>
    set((state) => {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex < state.sessionQuestions.length) {
        return { currentQuestionIndex: nextIndex };
      }
      return state;
    }),

  previousQuestion: () =>
    set((state) => {
      const prevIndex = state.currentQuestionIndex - 1;
      if (prevIndex >= 0) {
        return { currentQuestionIndex: prevIndex };
      }
      return state;
    }),

  updateTimer: (time) => set({ timeRemaining: time }),

  setSessionActive: (active) => set({ sessionActive: active }),

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

  updateAnswer: (questionId, answer) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    })),

  completeSession: async () => {
    set({ loading: true });
    try {
      const { currentSession, answers, sessionQuestions } = get();

      if (!currentSession) {
        throw new Error("No active session");
      }

      const answersToSubmit = Object.entries(answers);

      for (const [questionId, answerData] of answersToSubmit) {
        try {
          await apiClient.post(`/exam/${currentSession._id}/answer`, {
            questionId,
            answer: answerData.answer || "",
            timeSpent: answerData.timeSpent || 0,
          });
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(`Failed to submit answer for question ${questionId}:`, error);
          }
        }
      }

      const unansweredQuestionIds = sessionQuestions
        .map((q) => q._id)
        .filter((id) => !answers[id]);

      for (const questionId of unansweredQuestionIds) {
        try {
          await apiClient.post(`/exam/${currentSession._id}/answer`, {
            questionId,
            answer: "",
            timeSpent: 0,
          });
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(`Failed to submit unanswered question ${questionId}:`, error);
          }
        }
      }

      const response = await apiClient.post(`/exam/${currentSession._id}/complete`);

      set({
        currentResult: response.data.data.result,
        loading: false,
        sessionActive: false,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Session completion error:", error);
      }
      set({ loading: false, sessionActive: false, error: error.message });
    }
  },

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
    }),
}));

export default useExamStore;
