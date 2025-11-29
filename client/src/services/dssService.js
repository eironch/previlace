import apiClient from "./apiClient";

const dssService = {
  async getRecommendations() {
    const response = await apiClient.get("/dss/recommendations");
    return response.data;
  },

  async getLearningPath(examLevel = "Professional", daysAhead = 7) {
    const response = await apiClient.get("/dss/learning-path", {
      params: { examLevel, daysAhead },
    });
    return response.data;
  },

  async getStudyStreak() {
    const response = await apiClient.get("/dss/study-streak");
    return response.data;
  },

  async getWeeklyGoalProgress() {
    const response = await apiClient.get("/dss/weekly-goal");
    return response.data;
  },

  async getPriorityTopics() {
    const response = await apiClient.get("/dss/priority-topics");
    return response.data;
  },

  async checkInterventions() {
    const response = await apiClient.get("/dss/interventions");
    return response.data;
  },

  async applyAutoIntervention(type) {
    const response = await apiClient.post(`/dss/interventions/apply/${type}`);
    return response.data;
  },

  async createAdaptedQuiz(subjectId, examLevel = "Professional", questionCount = 20) {
    const response = await apiClient.post("/dss/quiz/adapted", {
      subjectId,
      examLevel,
      questionCount,
    });
    return response.data;
  },

  async getPredictiveAnalytics() {
    const response = await apiClient.get("/dss/predictive-analytics");
    return response.data;
  },

  async getTopicPredictions(topicId) {
    const response = await apiClient.get(`/dss/topic-predictions/${topicId}`);
    return response.data;
  },

  async getStudyLoadForecast(days = 7) {
    const response = await apiClient.get("/dss/study-load-forecast", {
      params: { days },
    });
    return response.data;
  },

  async getPerformanceTrend(days = 30) {
    const response = await apiClient.get("/dss/performance-trend", {
      params: { days },
    });
    return response.data;
  },

  async getExamCountdownPlan(examDate, examLevel = "Professional") {
    const response = await apiClient.get("/dss/exam-countdown", {
      params: { examDate, examLevel },
    });
    return response.data;
  },
};

export default dssService;
