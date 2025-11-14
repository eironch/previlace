import Topic from "../models/Topic.js";
import UserProgress from "../models/UserProgress.js";

async function getTopicsBySubject(req, res) {
  try {
    const { subjectId } = req.params;
    const userId = req.user._id;

    const topics = await Topic.getWithProgress(subjectId, userId);

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get topics error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics",
      error: error.message,
    });
  }
}

async function getTopicById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const topic = await Topic.findById(id).populate("subjectId");

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const progress = await topic.getProgress(userId);

    res.status(200).json({
      success: true,
      data: {
        ...topic.toObject(),
        progress,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get topic error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch topic",
      error: error.message,
    });
  }
}

async function createTopic(req, res) {
  try {
    const topicData = req.body;

    const topic = await Topic.create(topicData);

    const Subject = (await import("../models/Subject.js")).default;
    const subject = await Subject.findById(topic.subjectId);
    if (subject) {
      await subject.updateTopicCount();
    }

    res.status(201).json({
      success: true,
      data: topic,
      message: "Topic created successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Create topic error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to create topic",
      error: error.message,
    });
  }
}

async function updateTopic(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const topic = await Topic.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      data: topic,
      message: "Topic updated successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Update topic error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to update topic",
      error: error.message,
    });
  }
}

async function deleteTopic(req, res) {
  try {
    const { id } = req.params;

    const topic = await Topic.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const Subject = (await import("../models/Subject.js")).default;
    const subject = await Subject.findById(topic.subjectId);
    if (subject) {
      await subject.updateTopicCount();
    }

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Delete topic error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete topic",
      error: error.message,
    });
  }
}

export {
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
};
