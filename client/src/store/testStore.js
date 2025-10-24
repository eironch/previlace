import { create } from "zustand";
import { testService } from "../services/testService";

export const useTestStore = create((set, get) => ({
 currentTest: null,
 testQuestions: [],
 currentQuestionIndex: 0,
 answers: {},
 timeRemaining: 0,
 isActive: false,
 isSubmitting: false,
 testResult: null,
 error: null,

  startTest: async (testConfig) => {
    set({ error: null, isActive: false });
    
    try {
     const response = await testService.startTest(testConfig);
     
     if (response.success) {
      set({
       currentTest: response.data.test,
       testQuestions: response.data.questions,
       currentQuestionIndex: 0,
       answers: {},
       timeRemaining: response.data.test.timeLimit,
       isActive: true,
       testResult: null,
      });
      
      return { success: true };
     }
    } catch (error) {
     set({ error: error.message });
     return { success: false, error: error.message };
    }
   },

  answerQuestion: (questionId, answer) => {
    set((state) => ({
     answers: {
      ...state.answers,
      [questionId]: {
       answer,
       timestamp: Date.now(),
      },
     },
    }));
   },

  goToQuestion: (index) => {
    set({ currentQuestionIndex: index });
   },

  nextQuestion: () => {
    set((state) => ({
     currentQuestionIndex: Math.min(
      state.currentQuestionIndex + 1,
      state.testQuestions.length - 1
     ),
    }));
   },

  previousQuestion: () => {
    set((state) => ({
     currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    }));
   },

  updateTimer: (timeRemaining) => {
    set({ timeRemaining });
    
    if (timeRemaining <= 0) {
     get().submitTest();
    }
   },

  submitTest: async () => {
    const { currentTest, answers } = get();
    
    if (!currentTest) return { success: false, error: "No active test" };
    
    set({ isSubmitting: true, error: null });
    
    try {
     const response = await testService.submitTest(currentTest._id, answers);
     
     if (response.success) {
      set({
       testResult: response.data.result,
       isActive: false,
       isSubmitting: false,
      });
      
      return { success: true, result: response.data.result };
     }
    } catch (error) {
     set({ error: error.message, isSubmitting: false });
     return { success: false, error: error.message };
    }
   },

  resetTest: () => {
    set({
     currentTest: null,
     testQuestions: [],
     currentQuestionIndex: 0,
     answers: {},
     timeRemaining: 0,
     isActive: false,
     testResult: null,
     error: null,
    });
   },

  getCurrentQuestion: () => {
    const { testQuestions, currentQuestionIndex } = get();
    return testQuestions[currentQuestionIndex] || null;
   },

  isQuestionAnswered: (questionId) => {
    const { answers } = get();
    return answers[questionId] !== undefined;
   },

  getAnsweredCount: () => {
    const { answers } = get();
    return Object.keys(answers).length;
   },

  getProgress: () => {
    const { testQuestions, answers } = get();
    if (testQuestions.length === 0) return 0;
    return (Object.keys(answers).length / testQuestions.length) * 100;
   },
}));