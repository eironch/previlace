import apiClient from "./apiClient";

const adminAnalyticsService = {
  async getFSRSHealth() {
    const response = await apiClient.get("/admin/analytics/fsrs-health");
    return response.data;
  },

  async getRetentionCurve() {
    const response = await apiClient.get("/admin/analytics/retention-curve");
    return response.data;
  },

  async getWorkloadProjection(days = 7) {
    const response = await apiClient.get("/admin/analytics/workload-projection", {
      params: { days },
    });
    return response.data;
  },

  async getAccuracyMetrics() {
    const response = await apiClient.get("/admin/analytics/accuracy-metrics");
    return response.data;
  },

  async getParameterDistribution() {
    const response = await apiClient.get("/admin/analytics/parameter-distribution");
    return response.data;
  },

  async getContentEffectiveness() {
    const response = await apiClient.get("/admin/analytics/content-effectiveness");
    return response.data;
  },

  async getSubjectCompletionRates() {
    const response = await apiClient.get("/admin/analytics/subject-completion");
    return response.data;
  },

  async getBehaviorHeatmap() {
    const response = await apiClient.get("/admin/analytics/behavior-heatmap");
    return response.data;
  },

  async getSystemHealth() {
    const response = await apiClient.get("/admin/analytics/system-health");
    return response.data;
  },

  async getBehaviorTrends(days = 30) {
    const response = await apiClient.get("/admin/analytics/behavior-trends", {
      params: { days },
    });
    return response.data;
  },

  async getUserBehaviorTimeline(userId, days = 30) {
    const response = await apiClient.get(`/admin/analytics/user/${userId}/timeline`, {
      params: { days },
    });
    return response.data;
  },

  async getOptimizationQueue() {
    const response = await apiClient.get("/admin/analytics/optimization-queue");
    return response.data;
  },

  async triggerOptimization(userIds) {
    const response = await apiClient.post("/admin/analytics/trigger-optimization", {
      userIds,
    });
    return response.data;
  },
};

export default adminAnalyticsService;
