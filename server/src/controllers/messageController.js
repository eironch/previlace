import Message from "../models/Message.js";
import User from "../models/User.js";
import StudyPlan from "../models/StudyPlan.js";

export async function sendMessage(req, res) {
  try {
    const { questionText, subjectId, activityId, questionId, attachments } = req.body;

    if (!questionText || !subjectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const studyPlan = await StudyPlan.findOne({
      enrolledStudents: req.user._id,
      status: "active",
    }).populate("weeks.saturdaySession.instructorId weeks.sundaySession.instructorId");

    if (!studyPlan) {
      return res.status(404).json({ message: "No active study plan found" });
    }

    const currentDate = new Date();
    let currentWeek = studyPlan.weeks.find(week => {
      const start = new Date(week.startDate);
      const end = new Date(week.endDate);
      return currentDate >= start && currentDate <= end;
    });

    if (!currentWeek) {
      return res.status(400).json({ message: "Current week not found in study plan" });
    }

    let instructorId;
    if (currentWeek.saturdaySession && currentWeek.saturdaySession.subjectId.toString() === subjectId) {
      instructorId = currentWeek.saturdaySession.instructorId._id;
    } else if (currentWeek.sundaySession && currentWeek.sundaySession.subjectId.toString() === subjectId) {
      instructorId = currentWeek.sundaySession.instructorId._id;
    } else {
      return res.status(400).json({ message: "Subject not taught this week" });
    }

    const nextWeekStart = new Date(currentWeek.endDate);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);

    const message = new Message({
      studentId: req.user._id,
      instructorId,
      studyPlanId: studyPlan._id,
      weekNumber: currentWeek.weekNumber,
      subjectId,
      questionText,
      activityContext: {
        activityId,
        questionId,
      },
      attachments: attachments || [],
      expiresAt: nextWeekStart,
    });

    await message.save();

    await message.populate("studentId instructorId subjectId");

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error sending message:", error);
    }
    return res.status(500).json({ message: "Server error sending message" });
  }
}

export async function getStudentMessages(req, res) {
  try {
    const { status } = req.query;
    const filter = {
      studentId: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    const messages = await Message.find(filter)
      .populate("instructorId", "firstName lastName email")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ messages });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching student messages:", error);
    }
    return res.status(500).json({ message: "Server error fetching messages" });
  }
}

export async function getInstructorMessages(req, res) {
  try {
    const { status, subjectId } = req.query;
    const filter = {
      instructorId: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const messages = await Message.find(filter)
      .populate("studentId", "firstName lastName email")
      .populate("subjectId", "name")
      .populate("activityContext.activityId", "title activityType")
      .sort({ status: 1, createdAt: -1 });

    return res.status(200).json({ messages });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching instructor messages:", error);
    }
    return res.status(500).json({ message: "Server error fetching messages" });
  }
}

export async function getMessage(req, res) {
  try {
    const { id } = req.params;

    const message = await Message.findById(id)
      .populate("studentId", "firstName lastName email")
      .populate("instructorId", "firstName lastName email")
      .populate("subjectId", "name")
      .populate("activityContext.activityId", "title activityType")
      .populate("activityContext.questionId");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.studentId._id.toString() !== req.user._id.toString() &&
        message.instructorId._id.toString() !== req.user._id.toString() &&
        req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ message });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching message:", error);
    }
    return res.status(500).json({ message: "Server error fetching message" });
  }
}

export async function answerMessage(req, res) {
  try {
    const { id } = req.params;
    const { answerText } = req.body;

    if (!answerText) {
      return res.status(400).json({ message: "Answer text is required" });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only assigned instructor can answer" });
    }

    message.answerText = answerText;
    message.status = "answered";
    message.answeredAt = new Date();
    await message.save();

    await message.populate("studentId instructorId subjectId");

    return res.status(200).json({
      message: "Answer submitted successfully",
      data: message,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error answering message:", error);
    }
    return res.status(500).json({ message: "Server error answering message" });
  }
}

export async function resolveMessage(req, res) {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.studentId.toString() !== req.user._id.toString() &&
        message.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    message.status = "resolved";
    await message.save();

    return res.status(200).json({
      message: "Message marked as resolved",
      data: message,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error resolving message:", error);
    }
    return res.status(500).json({ message: "Server error resolving message" });
  }
}

export async function archiveExpiredMessages(req, res) {
  try {
    const now = new Date();

    const result = await Message.updateMany(
      {
        expiresAt: { $lt: now },
        status: { $ne: "archived" },
      },
      {
        status: "archived",
        archivedAt: now,
      }
    );

    return res.status(200).json({
      message: "Expired messages archived",
      count: result.modifiedCount,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error archiving messages:", error);
    }
    return res.status(500).json({ message: "Server error archiving messages" });
  }
}
