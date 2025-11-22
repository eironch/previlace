import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import analyticsController from "../controllers/analyticsController.js";

const router = express.Router();

router.use(authenticate);

router.get("/categories", analyticsController.getCategoryStatistics);
router.get("/weak-areas", analyticsController.getWeakAreas);
router.get("/readiness", analyticsController.getExamReadiness);
router.get("/progress", analyticsController.getProgressReport);
router.get("/percentile", analyticsController.getPercentileRank);
router.get("/dashboard", analyticsController.getStudentAnalytics);

export default router;
