import apiClient from "./apiClient";

export const journeyService = {
  initializeJourney: async (studyPlanId, journeyType = "linear") => {
    const response = await apiClient.post("/user-journeys/initialize", {
      studyPlanId,
      journeyType,
    });
    return response.data;
  },

  getJourney: async () => {
    const response = await apiClient.get("/user-journeys");
    return response.data;
  },

  getJourneyPath: async () => {
    const response = await apiClient.get("/user-journeys/path");
    return response.data;
  },

  getTodayActivities: async () => {
    const response = await apiClient.get("/user-journeys/today");
    return response.data;
  },

  getWeekProgress: async (weekNumber) => {
    const response = await apiClient.get(`/user-journeys/week/${weekNumber}`);
    return response.data;
  },

  unlockNextActivity: async () => {
    const response = await apiClient.post("/user-journeys/unlock-next");
    return response.data;
  },

  updateDailyGoal: async (dailyGoal) => {
    const response = await apiClient.put("/user-journeys/daily-goal", { dailyGoal });
    return response.data;
  },

  switchJourneyType: async (journeyType) => {
    const response = await apiClient.put("/user-journeys/journey-type", { journeyType });
    return response.data;
  },
};
