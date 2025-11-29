import express from "express";
import adminAnalyticsController from "../controllers/adminAnalyticsController.js";
import { authenticate, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.use(restrictTo("admin"));

router.get("/fsrs-health", adminAnalyticsController.getFSRSHealth);
router.get("/retention-curve", adminAnalyticsController.getRetentionCurve);
router.get("/workload-projection", adminAnalyticsController.getWorkloadProjection);
router.get("/accuracy-metrics", adminAnalyticsController.getAccuracyMetrics);
router.get("/parameter-distribution", adminAnalyticsController.getParameterDistribution);
router.get("/content-effectiveness", adminAnalyticsController.getContentEffectiveness);
router.get("/subject-completion", adminAnalyticsController.getSubjectCompletionRates);
router.get("/behavior-heatmap", adminAnalyticsController.getBehaviorHeatmap);
router.get("/system-health", adminAnalyticsController.getSystemHealth);
router.get("/behavior-trends", adminAnalyticsController.getAggregatedBehaviorTrends);
router.get("/user/:userId/timeline", adminAnalyticsController.getUserBehaviorTimeline);
router.get("/optimization-queue", adminAnalyticsController.getOptimizationQueue);
router.post("/trigger-optimization", adminAnalyticsController.triggerOptimization);

export default router;
