import apiClient from "./apiClient";

const studyStreakService = {
  async getStudyStreakData() {
    const { data } = await apiClient.get("/users/study-streak");
    return data;
  },

  async recordStudySession(sessionId) {
    const { data } = await apiClient.post("/users/study-streak/session", {
      sessionId,
    });
    return data;
  },
};

export { studyStreakService };
export default studyStreakService;
