import express from "express";
import {
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateStudyPlan,
  publishStudyPlan,
  activateStudyPlan,
  enrollStudent,
  addWeek,
  updateWeek,
  updateSession,
  removeWeek,
  getActiveStudyPlan,
  deleteStudyPlan,
} from "../controllers/studyPlanController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getStudyPlans);
router.get("/active", protect, getActiveStudyPlan);
router.get("/:id", protect, getStudyPlan);
router.post("/", protect, authorize("admin", "super_admin"), createStudyPlan);
router.put("/:id", protect, authorize("admin", "super_admin"), updateStudyPlan);
router.post("/:id/publish", protect, authorize("admin", "super_admin"), publishStudyPlan);
router.post("/:id/activate", protect, authorize("admin", "super_admin"), activateStudyPlan);
router.post("/:id/enroll", protect, authorize("admin", "super_admin"), enrollStudent);
router.post("/:id/weeks", protect, authorize("admin", "super_admin"), addWeek);
router.put("/:id/weeks/:weekNumber", protect, authorize("admin", "super_admin"), updateWeek);
router.put("/:id/weeks/:weekNumber/sessions/:day", protect, authorize("admin", "super_admin"), updateSession);
router.delete("/:id/weeks/:weekNumber", protect, authorize("admin", "super_admin"), removeWeek);
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteStudyPlan);

export default router;
