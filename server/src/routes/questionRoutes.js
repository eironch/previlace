import express from "express";
import QuestionController from "../controllers/questionController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/questions", authenticateToken, QuestionController.createQuestion);
router.post("/questions/bulk", authenticateToken, QuestionController.bulkCreateQuestions);
router.get("/questions", authenticateToken, QuestionController.getQuestions);
router.get("/questions/random", authenticateToken, QuestionController.getRandomQuestions);
router.get("/questions/statistics", authenticateToken, QuestionController.getQuestionStatistics);
router.get("/questions/search", authenticateToken, QuestionController.searchQuestions);
router.get("/questions/:id", authenticateToken, QuestionController.getQuestionById);
router.get("/questions/:id/render", authenticateToken, QuestionController.renderQuestion);
router.put("/questions/:id", authenticateToken, QuestionController.updateQuestion);
router.delete("/questions/:id", authenticateToken, QuestionController.deleteQuestion);
router.post("/questions/:id/submit-review", authenticateToken, QuestionController.submitForReview);
router.post("/questions/:id/review", authenticateToken, QuestionController.reviewQuestion);
router.post("/questions/:id/publish", authenticateToken, QuestionController.publishQuestion);
router.post("/questions/:id/clone", authenticateToken, QuestionController.cloneQuestion);
router.post("/questions/:id/check-answer", authenticateToken, QuestionController.checkAnswer);

export default router;