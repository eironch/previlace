import express from "express";
import {
    submitApplication,
    getApplications,
    getApplicationById,
    approveApplication,
    rejectApplication,
} from "../controllers/registrationController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for submission
router.post("/", submitApplication);

// Admin routes
router.get("/", protect, restrictTo("admin", "super_admin"), getApplications);
router.get("/:id", protect, restrictTo("admin", "super_admin"), getApplicationById);
router.post("/:id/approve", protect, restrictTo("admin", "super_admin"), approveApplication);
router.post("/:id/reject", protect, restrictTo("admin", "super_admin"), rejectApplication);

export default router;
