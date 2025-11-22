import express from "express";
import {
  setAvailability,
  getAvailability,
  getAllAvailabilities,
  addWeeklySlot,
  removeWeeklySlot,
  addSubject,
  removeSubject,
  getAvailableInstructors,
} from "../controllers/instructorAvailabilityController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "super_admin"), getAllAvailabilities);
router.get("/search", protect, authorize("admin", "super_admin"), getAvailableInstructors);
router.get("/:instructorId?", protect, getAvailability);
router.post("/", protect, authorize("instructor", "admin", "super_admin"), setAvailability);
router.post("/slots", protect, authorize("instructor", "admin", "super_admin"), addWeeklySlot);
router.delete("/slots/:slotId", protect, authorize("instructor", "admin", "super_admin"), removeWeeklySlot);
router.post("/subjects", protect, authorize("instructor", "admin", "super_admin"), addSubject);
router.delete("/subjects/:subjectId", protect, authorize("instructor", "admin", "super_admin"), removeSubject);

export default router;
