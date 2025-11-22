import express from "express";
import {
  startInterview,
  getInterviews,
  getInterview,
  submitAnswer,
  completeInterview,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", startInterview);
router.get("/", getInterviews);
router.get("/:id", getInterview);
router.post("/:id/answer", submitAnswer);
router.patch("/:id/complete", completeInterview);

export default router;
