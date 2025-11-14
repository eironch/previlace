import express from "express";
import {
  getLearningContentByTopic,
  createLearningContent,
  updateLearningContent,
  publishLearningContent,
  unpublishLearningContent,
  deleteLearningContent,
} from "../controllers/learningContentController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/topic/:topicId", protect, getLearningContentByTopic);
router.post("/", protect, restrictTo("admin"), createLearningContent);
router.put("/:id", protect, restrictTo("admin"), updateLearningContent);
router.put("/:id/publish", protect, restrictTo("admin"), publishLearningContent);
router.put(
  "/:id/unpublish",
  protect,
  restrictTo("admin"),
  unpublishLearningContent
);
router.delete("/:id", protect, restrictTo("admin"), deleteLearningContent);

export default router;
