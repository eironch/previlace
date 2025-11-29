import apiClient from "./apiClient";

const adaptivityService = {
  async getAdaptedQuizConfig(options = {}) {
    const params = new URLSearchParams();
    if (options.questionCount) params.append("questionCount", options.questionCount);
    if (options.examLevel) params.append("examLevel", options.examLevel);
    if (options.topicIds?.length) params.append("topicIds", options.topicIds.join(","));
    if (options.mode) params.append("mode", options.mode);

    const response = await apiClient.get(`/adaptivity/quiz-config?${params.toString()}`);
    return response.data;
  },

  async getMidQuizAdjustments(quizAttemptId, currentBehavior) {
    const response = await apiClient.post(`/adaptivity/mid-quiz-adjust/${quizAttemptId}`, currentBehavior);
    return response.data;
  },

  async getQuestionPriority(topicIds, count = 20, examLevel = null) {
    const params = new URLSearchParams();
    params.append("topicIds", topicIds.join(","));
    params.append("count", count);
    if (examLevel) params.append("examLevel", examLevel);

    const response = await apiClient.get(`/adaptivity/question-priority?${params.toString()}`);
    return response.data;
  },

  async getSessionRecommendations() {
    const response = await apiClient.get("/adaptivity/session-recommendations");
    return response.data;
  },

  async getReviewSummary() {
    const response = await apiClient.get("/adaptivity/review-summary");
    return response.data;
  },

  async getExamDayRecommendations(examDate) {
    const response = await apiClient.get(`/adaptivity/exam-recommendations?examDate=${examDate}`);
    return response.data;
  },

  async recordBehaviorFeedback(quizAttemptId, feedbackData) {
    const response = await apiClient.post(`/adaptivity/feedback/${quizAttemptId}`, feedbackData);
    return response.data;
  },
};

export default adaptivityService;
