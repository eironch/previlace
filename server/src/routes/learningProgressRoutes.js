import express from "express";
import learningProgressController from "../controllers/learningProgressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/track-view", learningProgressController.trackView);
router.get("/status/:topicId", learningProgressController.getStatus);
router.post("/complete", learningProgressController.markComplete);

export default router;
