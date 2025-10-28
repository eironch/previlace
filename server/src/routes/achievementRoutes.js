import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import achievementController from "../controllers/achievementController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", achievementController.getUserAchievements);

router.get("/displayed", achievementController.getDisplayedAchievements);

router.get("/available", achievementController.getAvailableAchievements);

router.get("/category/:category", achievementController.getAchievementsByCategory);

router.get("/stats", achievementController.getAchievementStats);

router.post("/check-new", achievementController.checkNewAchievements);

router.put("/:achievementId/display", achievementController.toggleAchievementDisplay);

export default router;
