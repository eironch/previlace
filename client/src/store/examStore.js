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
  analytics: null,
  examReadiness: null,
  studyPlan: null,
  spacedRepetitionData: null,
  reviewSchedule: null,

  startQuizSession: async (config) => {
    try {
      set({ loading: true, error: null });
      const response = await apiClient.post("/exam/start", config);

      set({
        currentSession: response.data.data.session,
        sessionQuestions: response.data.data.questions,
        questions: response.data.data.questions,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: config.timeLimit || 600,
        sessionActive: true,
        isPaused: false,
        loading: false,
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Start quiz session error:", err);
      }
      set({ error: err.message, loading: false });
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
        try {
          await apiClient.post(`/exam/${currentSession._id}/answer`, {
            questionId,
            answer: "",
            timeSpent: 0,
          });
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(
              `Failed to submit unanswered question ${questionId}:`,
              error
            );
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
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Session completion error:", error);
      }
      set({ loading: false, sessionActive: false, error: error.message });
    }
  },

  startMockExam: async (examLevel) => {
    try {
      set({ loading: true, error: null });
      const response = await apiClient.post("/exam/mock-exam", { examLevel });

      set({
        currentSession: response.data.data.session,
        sessionQuestions: response.data.data.questions,
        questions: response.data.data.questions,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: response.data.data.session.timeLimit,
        sessionActive: true,
        isPaused: false,
        loading: false,
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Start mock exam error:", err);
      }
      set({ error: err.message, loading: false });
    }
  },

  fetchAnalytics: async () => {
    try {
      set({ loading: true });
      const response = await apiClient.get("/exam/analytics");
      set({ analytics: response.data.data.analytics, loading: false });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Fetch analytics error:", err);
      }
      set({ error: err.message, loading: false });
    }
  },

  fetchExamReadiness: async (examLevel) => {
    try {
      set({ loading: true });
      const response = await apiClient.get("/exam/readiness", {
        params: { examLevel },
      });
      set({ examReadiness: response.data.data.readiness, loading: false });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Fetch exam readiness error:", err);
      }
      set({ error: err.message, loading: false });
    }
  },

  generateStudyPlan: async (targetDate) => {
    try {
      set({ loading: true });
      const response = await apiClient.post("/exam/study-plan/generate", {
        targetDate,
      });
      set({ studyPlan: response.data.data.studyPlan, loading: false });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Generate study plan error:", err);
      }
      set({ error: err.message, loading: false });
    }
  },

  trackStudySession: async (sessionData) => {
    try {
      const response = await apiClient.post(
        "/exam/study-plan/track",
        sessionData
      );
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Track study session error:", err);
      }
      throw err;
    }
  },

  fetchSpacedRepetitionQuestions: async (limit = 20) => {
    try {
      set({ loading: true });
      const response = await apiClient.get("/exam/spaced-repetition/due", {
        params: { limit },
      });
      set({
        spacedRepetitionData: response.data.data,
        sessionQuestions: response.data.data.questions,
        questions: response.data.data.questions,
        currentQuestionIndex: 0,
        answers: {},
        loading: false,
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Fetch spaced repetition questions error:", err);
      }
      set({ error: err.message, loading: false });
    }
  },

  fetchReviewSchedule: async (days = 7) => {
    try {
      const response = await apiClient.get("/exam/spaced-repetition/schedule", {
        params: { days },
      });
      set({ reviewSchedule: response.data.data.schedule });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Fetch review schedule error:", err);
      }
      set({ error: err.message });
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
      analytics: null,
      examReadiness: null,
      spacedRepetitionData: null,
    }),
}));

export default useExamStore;
