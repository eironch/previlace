import express from "express";
import { authenticate, restrictTo } from "../middleware/authMiddleware.js";
import dssController from "../controllers/dssController.js";

const router = express.Router();

router.use(authenticate);

router.get("/recommendations", dssController.getRecommendations);
router.get("/learning-path", dssController.getLearningPath);
router.get("/study-streak", dssController.getStudyStreak);
router.get("/weekly-goal", dssController.getWeeklyGoalProgress);
router.get("/priority-topics", dssController.getPriorityTopics);

router.get("/interventions", dssController.checkInterventions);
router.post("/interventions/apply/:type", dssController.applyAutoIntervention);

router.get("/admin/intervention-dashboard", restrictTo("admin"), dssController.getAdminInterventionDashboard);
router.get("/admin/metrics", restrictTo("admin"), dssController.getAdminDSSMetrics);
router.post("/admin/interventions/:userId/record", restrictTo("admin"), dssController.recordIntervention);

router.post("/quiz/adapted", dssController.createAdaptedQuiz);

router.get("/predictive-analytics", dssController.getPredictiveAnalytics);
router.get("/topic-predictions/:topicId", dssController.getTopicPredictions);
router.get("/study-load-forecast", dssController.getStudyLoadForecast);
router.get("/performance-trend", dssController.getPerformanceTrend);
router.get("/exam-countdown", dssController.getExamCountdownPlan);

export default router;
