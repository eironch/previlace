import express from "express";
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getJobs);
router.get("/:id", getJob);

// Protected routes for instructors and admins
router.post("/", restrictTo("instructor", "admin"), createJob);
router.patch("/:id", restrictTo("instructor", "admin"), updateJob);
router.delete("/:id", restrictTo("instructor", "admin"), deleteJob);

export default router;
