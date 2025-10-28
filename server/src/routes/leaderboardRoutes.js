import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import leaderboardController from "../controllers/leaderboardController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", leaderboardController.getLeaderboard);

router.get("/user/rank", leaderboardController.getUserRank);

router.get("/top-users", leaderboardController.getTopUsers);

router.get("/nearby", leaderboardController.getNearbyUsers);

router.get("/category", leaderboardController.getCategoryLeaderboard);

router.post("/update", leaderboardController.updateUserLeaderboard);

export default router;
