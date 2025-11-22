import express from "express";
import {
  getMyResume,
  updateResume,
  generatePDF,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyResume);
router.patch("/", updateResume);
router.get("/pdf", generatePDF);

export default router;
