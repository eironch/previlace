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

export {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
