import InquiryTicket from "../models/InquiryTicket.js";
import Subject from "../models/Subject.js";
import { AppError } from "../utils/AppError.js";

async function createTicket(req, res, next) {
  try {
    const { subjectId, title, question } = req.body;
    const studentId = req.user.id;

    const subject = await Subject.findById(subjectId).populate("instructor");
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }

    if (!subject.instructor) {
      throw new AppError("Subject has no assigned instructor", 400);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const ticket = await InquiryTicket.create({
      student: studentId,
      subject: subjectId,
      instructor: subject.instructor._id,
      title,
      question,
      expiresAt,
    });

    const populatedTicket = await InquiryTicket.findById(ticket._id)
      .populate("student", "firstName lastName email")
      .populate("instructor", "firstName lastName email")
      .populate("subject", "name");

    res.status(201).json(populatedTicket);
  } catch (error) {
    next(error);
  }
}

async function getStudentTickets(req, res, next) {
  try {
    const studentId = req.user.id;
    const { status } = req.query;

    const filter = { student: studentId };
    if (status) {
      filter.status = status;
    }

    const tickets = await InquiryTicket.find(filter)
      .populate("subject", "name")
      .populate("instructor", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

async function getInstructorTickets(req, res, next) {
  try {
    const instructorId = req.user.id;
    const { status, subjectId } = req.query;

    const filter = { instructor: instructorId };
    if (status) {
      filter.status = status;
    }
    if (subjectId) {
      filter.subject = subjectId;
    }

    const tickets = await InquiryTicket.find(filter)
      .populate("student", "firstName lastName email")
      .populate("subject", "name")
      .sort({ priority: -1, createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

async function getTicketById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await InquiryTicket.findById(id)
      .populate("student", "firstName lastName email")
      .populate("instructor", "firstName lastName email")
      .populate("subject", "name")
      .populate("responses.author", "firstName lastName")
      .populate("internalNotes.author", "firstName lastName");

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    if (
      ticket.student._id.toString() !== userId &&
      ticket.instructor._id.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      throw new AppError("Unauthorized to view this ticket", 403);
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

async function addResponse(req, res, next) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const ticket = await InquiryTicket.findById(id);
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    if (
      ticket.student.toString() !== userId &&
      ticket.instructor.toString() !== userId
    ) {
      throw new AppError("Unauthorized to respond to this ticket", 403);
    }

    await ticket.addResponse(userId, message);

    const updatedTicket = await InquiryTicket.findById(id)
      .populate("student", "firstName lastName email")
      .populate("instructor", "firstName lastName email")
      .populate("subject", "name")
      .populate("responses.author", "firstName lastName");

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
}

async function addInternalNote(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      throw new AppError("Only instructors can add internal notes", 403);
    }

    const ticket = await InquiryTicket.findById(id);
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    await ticket.addInternalNote(userId, note);

    const updatedTicket = await InquiryTicket.findById(id).populate(
      "internalNotes.author",
      "firstName lastName"
    );

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
}

async function updateTicketStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const ticket = await InquiryTicket.findById(id);
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    if (
      ticket.instructor.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      throw new AppError("Unauthorized to update ticket status", 403);
    }

    if (status === "resolved") {
      await ticket.resolve();
    } else {
      ticket.status = status;
      await ticket.save();
    }

    const updatedTicket = await InquiryTicket.findById(id)
      .populate("student", "firstName lastName email")
      .populate("instructor", "firstName lastName email")
      .populate("subject", "name");

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
}

async function getTicketAnalytics(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      throw new AppError("Unauthorized", 403);
    }

    const analytics = await InquiryTicket.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
          avgResolutionTime: [
            { $match: { status: "resolved" } },
            { $group: { _id: null, avgTime: { $avg: "$resolutionTime" } } },
          ],
        },
      },
    ]);

    res.json(analytics[0]);
  } catch (error) {
    next(error);
  }
}

async function expireOldTickets() {
  try {
    const now = new Date();
    const result = await InquiryTicket.updateMany(
      {
        expiresAt: { $lt: now },
        status: { $in: ["open", "in_progress"] },
      },
      { $set: { status: "expired" } }
    );

    if (process.env.NODE_ENV === "development") {
      console.error(`Expired ${result.modifiedCount} tickets`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error expiring tickets:", error);
    }
  }
}

async function bulkUpdateTickets(req, res, next) {
  try {
    const { ticketIds, action, value } = req.body;
    const userId = req.user.id;

    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      throw new AppError("Unauthorized", 403);
    }

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      throw new AppError("No tickets provided", 400);
    }

    let updateQuery = {};

    if (action === "status") {
      if (value === "resolved") {
        updateQuery = {
          status: "resolved",
          resolvedAt: new Date(),
          // Note: resolutionTime calculation for bulk update is complex in Mongo, 
          // might need individual updates or aggregation pipeline if critical.
          // For now, we'll skip resolutionTime for bulk resolve or set it roughly.
        };
      } else {
        updateQuery = { status: value };
      }
    } else if (action === "assign" && req.user.role === "admin") {
      updateQuery = { instructor: value };
    } else {
      throw new AppError("Invalid bulk action", 400);
    }

    // Security check: ensure instructor only updates their own tickets (unless admin)
    const filter = { _id: { $in: ticketIds } };
    if (req.user.role !== "admin") {
      filter.instructor = userId;
    }

    const result = await InquiryTicket.updateMany(filter, { $set: updateQuery });

    res.json({
      message: "Tickets updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
}

export {
  createTicket,
  getStudentTickets,
  getInstructorTickets,
  getTicketById,
  addResponse,
  addInternalNote,
  updateTicketStatus,
  getTicketAnalytics,
  expireOldTickets,
  bulkUpdateTickets,
};
