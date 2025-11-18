import express from "express";
import examController from "../controllers/examController.js";
import { protect } from "../middleware/authMiddleware.js";
import { 
  validateQuizConfig, 
  validateStudyPlan, 
  validateStudySession,
  validateAnswerSubmission,
  validateExamReadiness,
  validateSpacedRepetition,
  handleValidationErrors 
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/start", validateQuizConfig, examController.startQuizSession);
router.post("/mock-exam", examController.startMockExam);
router.post("/subject-quiz", examController.startSubjectQuiz);
router.post("/topic-quiz", examController.startTopicQuiz);
router.post("/:sessionId/answer", validateAnswerSubmission, examController.submitAnswer);
router.post("/:sessionId/complete", examController.completeQuizSession);
router.post("/:sessionId/pause", examController.pauseQuizSession);
router.post("/:sessionId/resume", examController.resumeQuizSession);

router.get("/history", examController.getSessionHistory);
router.get("/stats", examController.getUserStats);
router.get("/:sessionId/result", examController.getQuizResult);
router.post("/:sessionId/export-pdf", examController.exportQuizResultPdf);
router.get("/analytics", examController.getPerformanceAnalytics);
router.get("/readiness", validateExamReadiness, handleValidationErrors, examController.getExamReadiness);
router.get("/spaced-repetition/due", validateSpacedRepetition, handleValidationErrors, examController.getSpacedRepetitionQuestions);
router.get("/spaced-repetition/schedule", validateSpacedRepetition, handleValidationErrors, examController.getReviewSchedule);

router.post("/study-plan/generate", validateStudyPlan, examController.generateStudyPlan);
router.post("/study-plan/track", validateStudySession, examController.trackStudySession);

export default router;
