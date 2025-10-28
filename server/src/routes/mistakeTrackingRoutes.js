import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import mistakeTrackingController from "../controllers/mistakeTrackingController.js";

const router = express.Router();

router.use(authenticate);

router.get("/analysis", mistakeTrackingController.getMistakeAnalysis);
router.get("/remediation", mistakeTrackingController.getRemediationPlan);
router.get("/frequency", mistakeTrackingController.getMistakeFrequency);
router.get("/systematic-errors", mistakeTrackingController.getSystematicErrors);
router.post("/quiz", mistakeTrackingController.createMistakeQuiz);

export default router;
