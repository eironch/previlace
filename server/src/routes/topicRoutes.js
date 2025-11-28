import express from "express";
import {
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  toggleTopicPublish,
} from "../controllers/topicController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/subject/:subjectId", protect, getTopicsBySubject);
router.get("/:id", protect, getTopicById);
router.post("/", protect, restrictTo("admin"), createTopic);
router.put("/:id", protect, restrictTo("admin"), updateTopic);
router.delete("/:id", protect, restrictTo("admin"), deleteTopic);
router.patch("/:id/publish", protect, restrictTo("admin"), toggleTopicPublish);

export default router;
