import express from "express";
import testController from "../controllers/testController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/start", testController.startTest);
router.post("/:id/submit", testController.submitTest);
router.get("/:id/result", testController.getTestResult);
router.get("/history", testController.getTestHistory);
router.patch("/:id/pause", testController.pauseTest);
router.patch("/:id/resume", testController.resumeTest);
router.get("/stats", testController.getUserStats);

export default router;