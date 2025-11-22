import apiClient from "./apiClient";

const activityService = {
  generateActivities: async (studyPlanId, weekNumber) => {
    const response = await apiClient.post("/activities/generate", {
      studyPlanId,
      weekNumber,
    });
    return response.data;
  },

  getActivitiesByWeek: async (studyPlanId, weekNumber) => {
    const response = await apiClient.get(`/activities/week/${studyPlanId}/${weekNumber}`);
    return response.data;
  },

  getActivity: async (id) => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  startActivity: async (id) => {
    const response = await apiClient.post(`/activities/${id}/start`);
    return response.data;
  },

  submitAnswer: async (id, questionId, selectedAnswer, timeSpent) => {
    const response = await apiClient.post(`/activities/${id}/answer`, {
      questionId,
      selectedAnswer,
      timeSpent,
    });
    return response.data;
  },

  completeActivity: async (id) => {
    const response = await apiClient.post(`/activities/${id}/complete`);
    return response.data;
  },

  getMistakeReview: async (limit = 10) => {
    const response = await apiClient.get(`/activities/mistakes?limit=${limit}`);
    return response.data;
  },

  getActivitySummary: async (id) => {
    const response = await apiClient.get(`/activities/${id}/summary`);
    return response.data;
  },

  getProgressFeedback: async (subjectId, timeframe = 7) => {
    const response = await apiClient.get(
      `/activities/progress-feedback?subjectId=${subjectId}&timeframe=${timeframe}`
    );
    return response.data;
  },

  regenerateActivity: async (id) => {
    const response = await apiClient.post(`/activities/${id}/regenerate`);
    return response.data;
  },

  getTodayActivity: async () => {
    const response = await apiClient.get("/activities/today");
    return response.data;
  },

  getWeeklyProgress: async () => {
    const response = await apiClient.get("/activities/weekly-progress");
    return response.data;
  },
};

export default activityService;
