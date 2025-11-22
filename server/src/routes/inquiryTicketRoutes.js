import express from "express";
import {
  createTicket,
  getStudentTickets,
  getInstructorTickets,
  getTicketById,
  addResponse,
  addInternalNote,
  updateTicketStatus,
  getTicketAnalytics,
  bulkUpdateTickets,
} from "../controllers/inquiryTicketController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTicket);
router.get("/student", getStudentTickets);
router.get(
  "/instructor",
  restrictTo("instructor", "admin"),
  getInstructorTickets
);
router.get("/analytics", restrictTo("admin"), getTicketAnalytics);
router.get("/:id", getTicketById);
router.post("/:id/response", addResponse);
router.post(
  "/:id/internal-note",
  restrictTo("instructor", "admin"),
  addInternalNote
);
router.patch(
  "/:id/status",
  restrictTo("instructor", "admin"),
  updateTicketStatus
);
router.patch(
  "/bulk-update",
  restrictTo("instructor", "admin"),
  bulkUpdateTickets
);

export default router;
