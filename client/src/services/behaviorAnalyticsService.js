import apiClient from "./apiClient";

const behaviorAnalyticsService = {
  async saveQuizBehavior(quizAttemptId, behaviorData) {
    const response = await apiClient.post("/behavior-analytics/quiz-behavior", {
      quizAttemptId,
      ...behaviorData,
    });
    return response.data;
  },

  async batchSaveEvents(events) {
    const response = await apiClient.post("/behavior-analytics/events", {
      events,
    });
    return response.data;
  },

  async getUserBehaviorProfile() {
    const response = await apiClient.get("/behavior-analytics/profile");
    return response.data;
  },

  async getQuizBehavior(quizAttemptId) {
    const response = await apiClient.get(`/behavior-analytics/quiz/${quizAttemptId}`);
    return response.data;
  },

  async getIntegrityStats() {
    const response = await apiClient.get("/behavior-analytics/integrity-stats");
    return response.data;
  },

  async getBehaviorTrends(days = 30) {
    const response = await apiClient.get("/behavior-analytics/trends", {
      params: { days },
    });
    return response.data;
  },

  async getFlaggedSessions(filters = {}) {
    const response = await apiClient.get("/behavior-analytics/flagged", {
      params: filters,
    });
    return response.data;
  },

  async reviewFlaggedSession(sessionId, reviewData) {
    const response = await apiClient.patch(
      `/behavior-analytics/flagged/${sessionId}/review`,
      reviewData
    );
    return response.data;
  },

  async getSessionReplayUrl(sessionId) {
    const response = await apiClient.get(`/behavior-analytics/session/${sessionId}/replay`);
    return response.data;
  },

  async getDSSRecommendations() {
    const response = await apiClient.get("/behavior-analytics/recommendations");
    return response.data;
  },

  async getAdminAnalyticsOverview() {
    const response = await apiClient.get("/behavior-analytics/admin/overview");
    return response.data;
  },

  async getAdminBehaviorPatterns() {
    const response = await apiClient.get("/behavior-analytics/admin/patterns");
    return response.data;
  },

  async getAdminIntegrityDistribution() {
    const response = await apiClient.get("/behavior-analytics/admin/integrity-distribution");
    return response.data;
  },

  async getInterventionQueue() {
    const response = await apiClient.get("/behavior-analytics/admin/intervention-queue");
    return response.data;
  },

  async getUserBehaviorDetail(userId) {
    const response = await apiClient.get(`/behavior-analytics/admin/user/${userId}`);
    return response.data;
  },
};

export default behaviorAnalyticsService;
