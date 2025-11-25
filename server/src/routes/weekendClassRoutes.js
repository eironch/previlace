import express from "express";
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getUpcomingClass,
} from "../controllers/weekendClassController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/upcoming", protect, getUpcomingClass);

router
  .route("/")
  .get(protect, getAllClasses)
  .post(protect, restrictTo("admin", "instructor"), createClass);

router
  .route("/:id")
  .patch(protect, restrictTo("admin", "instructor"), updateClass)
  .delete(protect, restrictTo("admin"), deleteClass);

export default router;
