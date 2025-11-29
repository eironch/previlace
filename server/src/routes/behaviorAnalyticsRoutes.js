import express from "express";
import { authenticate, restrictTo } from "../middleware/authMiddleware.js";
import behaviorAnalyticsController from "../controllers/behaviorAnalyticsController.js";

const router = express.Router();

router.use(authenticate);

router.post("/quiz-behavior", behaviorAnalyticsController.saveQuizBehavior);
router.post("/events", behaviorAnalyticsController.batchSaveEvents);

router.get("/profile", behaviorAnalyticsController.getUserProfile);
router.get("/quiz/:quizAttemptId", behaviorAnalyticsController.getQuizBehavior);
router.get("/integrity-stats", behaviorAnalyticsController.getIntegrityStats);
router.get("/trends", behaviorAnalyticsController.getBehaviorTrends);
router.get("/recommendations", behaviorAnalyticsController.getDSSRecommendations);

router.get("/flagged", restrictTo('admin'), behaviorAnalyticsController.getFlaggedSessions);
router.patch("/flagged/:sessionId/review", restrictTo('admin'), behaviorAnalyticsController.reviewFlaggedSession);
router.get("/session/:sessionId/replay", restrictTo('admin'), behaviorAnalyticsController.getSessionReplayUrl);

router.get("/admin/overview", restrictTo('admin'), behaviorAnalyticsController.getAdminOverview);
router.get("/admin/patterns", restrictTo('admin'), behaviorAnalyticsController.getAdminBehaviorPatterns);
router.get("/admin/integrity-distribution", restrictTo('admin'), behaviorAnalyticsController.getIntegrityDistribution);
router.get("/admin/intervention-queue", restrictTo('admin'), behaviorAnalyticsController.getInterventionQueue);
router.get("/admin/user/:userId", restrictTo('admin'), behaviorAnalyticsController.getUserBehaviorDetail);
router.get("/admin/fsrs-health", restrictTo('admin'), behaviorAnalyticsController.getFSRSHealth);
router.get("/admin/retention-curve", restrictTo('admin'), behaviorAnalyticsController.getRetentionCurve);
router.get("/admin/dss-metrics", restrictTo('admin'), behaviorAnalyticsController.getDSSMetrics);
router.post("/optimize-fsrs/:userId?", behaviorAnalyticsController.optimizeUserFSRS);

export default router;
