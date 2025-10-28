import express from "express";
import seedController from "../controllers/seedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/populate", seedController.populateTestData);
router.delete("/clear", seedController.clearTestData);
router.post("/comprehensive", seedController.seedComprehensiveData);
router.post("/questions", seedController.seedQuestions);
router.delete("/questions", seedController.resetQuestions);
router.get("/questions/count", seedController.getQuestionCount);

export default router;
