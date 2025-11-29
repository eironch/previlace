import express from "express";
import adaptivityController from "../controllers/adaptivityController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/quiz-config", adaptivityController.getAdaptedQuizConfig);
router.post("/mid-quiz-adjust/:quizAttemptId", adaptivityController.getMidQuizAdjustments);
router.get("/question-priority", adaptivityController.getQuestionPriority);
router.get("/session-recommendations", adaptivityController.getSessionRecommendations);
router.get("/review-summary", adaptivityController.getReviewSummary);
router.get("/exam-recommendations", adaptivityController.getExamDayRecommendations);
router.post("/feedback/:quizAttemptId", adaptivityController.recordBehaviorFeedback);

export default router;
