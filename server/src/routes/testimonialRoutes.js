// src/routes/testimonialRoutes.js (UPDATED)

import express from "express";
import TestimonialController from "../controllers/testimonialController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js"; 
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// --- NEW PUBLIC ROUTE ---
// This route is public and should be hit by your LandingPage fetch call.
// You must mount this under a specific public path in your server.js (e.g., /api/public/testimonials)
router.get("/approved", TestimonialController.getApprovedTestimonials);


// --- Public/User Routes (Authenticated Users) ---
router.post("/", protect, TestimonialController.submitTestimonial);

// --- Admin/Management Routes (Admin Role Required) ---
router.get("/", requireAdmin, TestimonialController.getTestimonials);
router.post("/:id/approve", requireAdmin, TestimonialController.approveTestimonial);
router.post("/:id/reject", requireAdmin, TestimonialController.rejectTestimonial);
router.post("/:id/request-changes", requireAdmin, TestimonialController.requestChanges);
router.put("/:id", requireAdmin, TestimonialController.updateTestimonial);
router.delete("/:id", requireAdmin, TestimonialController.deleteTestimonial);

export default router;