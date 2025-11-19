import express from "express";
import TestimonialController from "../controllers/testimonialController.js";

const publicRouter = express.Router();

// 1. Completely Public Read Route (No middleware)
publicRouter.get("/approved", TestimonialController.getApprovedTestimonials);

// You can add other public read-only endpoints here later.

export default publicRouter;