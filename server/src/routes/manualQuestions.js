import express from "express";
import manualQuestionController from "../controllers/manualQuestionController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", manualQuestionController.getQuestions);
router.get("/stats", manualQuestionController.getQuestionStats);
router.get("/counts", manualQuestionController.getQuestionCounts);
router.get("/random", manualQuestionController.getRandomQuestions);
router.get("/:id", manualQuestionController.getQuestionById);

router.post("/", manualQuestionController.createQuestion);
router.post("/validate", manualQuestionController.validateQuestionContent);
router.post("/:id/duplicate", manualQuestionController.duplicateQuestion);

router.put("/:id", manualQuestionController.updateQuestion);
router.patch("/:id/submit", manualQuestionController.submitForReview);
router.patch("/:id/review", manualQuestionController.reviewQuestion);

router.delete("/:id", manualQuestionController.deleteQuestion);

export default router;
