import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectPublish,
  getInstructorSubjects,
} from "../controllers/subjectController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/instructor/my-subjects", protect, restrictTo("instructor"), getInstructorSubjects);
router.get("/", protect, getAllSubjects);
router.get("/:id", protect, getSubjectById);
router.post("/", protect, restrictTo("admin"), createSubject);
router.put("/:id", protect, restrictTo("admin"), updateSubject);
router.delete("/:id", protect, restrictTo("admin"), deleteSubject);
router.patch("/:id/publish", protect, restrictTo("admin"), toggleSubjectPublish);

export default router;
