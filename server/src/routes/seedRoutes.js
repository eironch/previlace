import express from "express";
import seedController from "../controllers/seedController.js";

const router = express.Router();

router.post("/populate", seedController.populateTestData);
router.delete("/clear", seedController.clearTestData);
router.post("/comprehensive", seedController.seedComprehensiveData);
router.post("/questions", seedController.seedQuestions);
router.delete("/questions", seedController.resetQuestions);
router.get("/questions/count", seedController.getQuestionCount);
router.post("/reset-and-reseed", seedController.resetAndReseed);
router.post("/registrations", seedController.seedRegistrations);

export default router;
