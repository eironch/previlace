import express from "express";
import {
  initializeJourney,
  getJourney,
  getJourneyPath,
  getTodayActivities,
  getWeekProgress,
  unlockNextActivity,
  updateDailyGoal,
  switchJourneyType,
} from "../controllers/userJourneyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/initialize", protect, initializeJourney);
router.get("/", protect, getJourney);
router.get("/path", protect, getJourneyPath);
router.get("/today", protect, getTodayActivities);
router.get("/week/:weekNumber", protect, getWeekProgress);
router.post("/unlock-next", protect, unlockNextActivity);
router.put("/daily-goal", protect, updateDailyGoal);
router.put("/journey-type", protect, switchJourneyType);

export default router;
