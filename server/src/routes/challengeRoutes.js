import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import challengeController from "../controllers/challengeController.js";

const router = express.Router();

router.use(authenticate);

router.post("/send", challengeController.sendChallenge);

router.get("/pending", challengeController.getPendingChallenges);

router.get("/active", challengeController.getActiveChallenges);

router.get("/history", challengeController.getChallengeHistory);

router.get("/stats", challengeController.getUserChallengeStats);

router.put("/:challengeId/accept", challengeController.acceptChallenge);

router.put("/:challengeId/decline", challengeController.declineChallenge);

router.post("/:challengeId/score", challengeController.recordChallengeScore);

export default router;
