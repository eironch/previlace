import express from "express";
import {
  generateActivities,
  getActivitiesByWeek,
  getActivity,
  startActivity,
  submitAnswer,
  completeActivity,
  getMistakeReview,
  getActivitySummary,
  getProgressFeedback,
  regenerateActivity,
  getTodayActivity,
  getWeeklyProgress,
} from "../controllers/activityController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, authorize("admin", "super_admin"), generateActivities);
router.get("/today", protect, getTodayActivity);
router.get("/weekly-progress", protect, getWeeklyProgress);
router.get("/week/:studyPlanId/:weekNumber", protect, getActivitiesByWeek);
router.get("/mistakes", protect, getMistakeReview);
router.get("/progress-feedback", protect, getProgressFeedback);
router.get("/:id", protect, getActivity);
router.post("/:id/start", protect, startActivity);
router.post("/:id/answer", protect, submitAnswer);
router.post("/:id/complete", protect, completeActivity);
router.get("/:id/summary", protect, getActivitySummary);
router.post("/:id/regenerate", protect, authorize("admin", "super_admin"), regenerateActivity);

export default router;
