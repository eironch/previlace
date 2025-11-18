import express from "express";
import TestimonialController from "../controllers/testimonialController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js"; 
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// --- PUBLIC ROUTE ---
// Fetches approved testimonials for public display (assuming you have a dedicated public route for this)
// This route is missing from your snippet, but is required for the client's fetchApprovedTestimonials:
// router.get("/public/approved", TestimonialController.getApprovedTestimonials); 

// --- /api/testimonials ROUTES ---
// 1. POST /api/testimonials: User submits a new testimonial
router.post("/", protect, TestimonialController.submitTestimonial);
router.get("/", protect, requireAdmin, TestimonialController.getTestimonials);
router.put("/:id", protect, requireAdmin, TestimonialController.updateTestimonial);
router.delete("/:id", protect, requireAdmin, TestimonialController.deleteTestimonial);


export default router;