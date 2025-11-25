import express from "express";
import weekendClassController from "../controllers/weekendClassController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/upcoming", protect, weekendClassController.getUpcomingClass);
router.post("/", protect, restrictTo("admin", "instructor"), weekendClassController.createOrUpdateClass);

export default router;
