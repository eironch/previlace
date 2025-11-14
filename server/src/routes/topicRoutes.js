import express from "express";
import {
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/subject/:subjectId", protect, getTopicsBySubject);
router.get("/:id", protect, getTopicById);
router.post("/", protect, restrictTo("admin"), createTopic);
router.put("/:id", protect, restrictTo("admin"), updateTopic);
router.delete("/:id", protect, restrictTo("admin"), deleteTopic);

export default router;
