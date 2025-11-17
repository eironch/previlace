import express from "express";
import TestimonialController from "../controllers/testimonialController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js"; 
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// --- USER/ADMIN AUTHENTICATED ROUTES ---
// This handles: POST /api/testimonials (Submission) and GET /api/testimonials (Admin View)
router.post("/", protect, TestimonialController.submitTestimonial);
router.get("/", protect, requireAdmin, TestimonialController.getTestimonials); // Admin View

// --- ADMIN ACTIONS ---
router.post("/:id/approve", protect, requireAdmin, TestimonialController.approveTestimonial);
router.post("/:id/reject", protect, requireAdmin, TestimonialController.rejectTestimonial);
router.put("/:id", protect, requireAdmin, TestimonialController.updateTestimonial);
router.delete("/:id", protect, requireAdmin, TestimonialController.deleteTestimonial);

export default router;