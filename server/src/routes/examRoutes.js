import express from "express";
import examController from "../controllers/examController.js";
import { protect } from "../middleware/authMiddleware.js";
import { 
  validateQuizConfig, 
  validateStudyPlan, 
  validateStudySession,
  validateAnswerSubmission,
  validateExamReadiness,
  handleValidationErrors 
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/start", validateQuizConfig, examController.startQuizSession);
router.post("/mock-exam", examController.startMockExam);
router.post("/subject-quiz", examController.startSubjectQuiz);
router.post("/topic-quiz", examController.startTopicQuiz);
router.post("/post-test", examController.startPostTest);
router.post("/assessment", examController.startAssessment);
router.post("/daily-practice", examController.startDailyPractice);
router.post("/pretest", examController.startPretest);
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
router.get("/post-test-status", examController.getPostTestStatus);
router.get("/pretest-availability", examController.checkPretestAvailability);

router.post("/study-plan/generate", validateStudyPlan, examController.generateStudyPlan);
router.post("/study-plan/track", validateStudySession, examController.trackStudySession);

export default router;
