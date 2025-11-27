import Subject from "../models/Subject.js";
import UserProgress from "../models/UserProgress.js";

async function getAllSubjects(req, res) {
  try {
    const { examLevel } = req.query;
    const userId = req.user._id;

    let subjects;
    if (examLevel) {
      subjects = await Subject.getWithProgress(userId, examLevel);
    } else {
      subjects = await Subject.find({ isActive: true }).sort({ order: 1 });
    }

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get subjects error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
}

async function getSubjectById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const progress = await subject.getProgress(userId);

    res.status(200).json({
      success: true,
      data: {
        ...subject.toObject(),
        progress: progress
          ? {
            completedTopics: progress.completedTopics.length,
            totalAttempts: progress.totalAttempts,
            averageScore: progress.averageScore,
            lastAccessedAt: progress.lastAccessedAt,
          }
          : null,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get subject error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch subject",
      error: error.message,
    });
  }
}

async function createSubject(req, res) {
  try {
    const subjectData = req.body;

    const subject = await Subject.create(subjectData);

    res.status(201).json({
      success: true,
      data: subject,
      message: "Subject created successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Create subject error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to create subject",
      error: error.message,
    });
  }
}

async function updateSubject(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const subject = await Subject.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
      message: "Subject updated successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Update subject error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to update subject",
      error: error.message,
    });
  }
}

async function deleteSubject(req, res) {
  try {
    const { id } = req.params;

    const subject = await Subject.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Delete subject error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete subject",
      error: error.message,
    });
  }
}

async function getInstructorSubjects(req, res) {
  try {
    const instructorId = req.user._id;
    const mongoose = await import("mongoose");

    const subjects = await Subject.find({ instructor: instructorId, isActive: true });

    const subjectsWithStats = await Promise.all(subjects.map(async (subject) => {
      // Count tickets
      const InquiryTicket = mongoose.default.model("InquiryTicket");
      const openTickets = await InquiryTicket.countDocuments({ subject: subject._id, status: { $in: ['open', 'in_progress'] } });

      // Count students who have progress in this subject
      const UserProgress = mongoose.default.model("UserProgress");
      const activeStudents = await UserProgress.countDocuments({ subjectId: subject._id });

      // Average score in this subject
      const progress = await UserProgress.find({ subjectId: subject._id });
      const totalScore = progress.reduce((acc, curr) => acc + (curr.averageScore || 0), 0);
      const avgScore = progress.length > 0 ? totalScore / progress.length : 0;

      return {
        ...subject.toObject(),
        stats: {
          openTickets,
          activeStudents,
          averageScore: Math.round(avgScore * 10) / 10
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: subjectsWithStats,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get instructor subjects error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch instructor subjects",
      error: error.message,
    });
  }
}

export {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getInstructorSubjects,
};
