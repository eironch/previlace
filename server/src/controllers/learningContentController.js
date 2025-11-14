import LearningContent from "../models/LearningContent.js";
import UserProgress from "../models/UserProgress.js";
import Topic from "../models/Topic.js";

async function getLearningContentByTopic(req, res) {
  try {
    const { topicId } = req.params;
    const userId = req.user._id;

    const content = await LearningContent.getByTopic(topicId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Learning content not found for this topic",
      });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const progress = await UserProgress.getOrCreate(userId, topic.subjectId);
    await progress.markContentViewed(topicId);

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get learning content error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch learning content",
      error: error.message,
    });
  }
}

async function createLearningContent(req, res) {
  try {
    const contentData = req.body;

    const existing = await LearningContent.findOne({
      topicId: contentData.topicId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Learning content already exists for this topic",
      });
    }

    const content = await LearningContent.create(contentData);

    const topic = await Topic.findById(contentData.topicId);
    if (topic) {
      topic.hasLearningContent = true;
      await topic.save();
    }

    res.status(201).json({
      success: true,
      data: content,
      message: "Learning content created successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Create learning content error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to create learning content",
      error: error.message,
    });
  }
}

async function updateLearningContent(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const content = await LearningContent.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Learning content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: content,
      message: "Learning content updated successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Update learning content error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to update learning content",
      error: error.message,
    });
  }
}

async function publishLearningContent(req, res) {
  try {
    const { id } = req.params;

    const content = await LearningContent.findById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Learning content not found",
      });
    }

    await content.publish();

    res.status(200).json({
      success: true,
      data: content,
      message: "Learning content published successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Publish learning content error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to publish learning content",
      error: error.message,
    });
  }
}

async function unpublishLearningContent(req, res) {
  try {
    const { id } = req.params;

    const content = await LearningContent.findById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Learning content not found",
      });
    }

    await content.unpublish();

    res.status(200).json({
      success: true,
      data: content,
      message: "Learning content unpublished successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Unpublish learning content error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to unpublish learning content",
      error: error.message,
    });
  }
}

async function deleteLearningContent(req, res) {
  try {
    const { id } = req.params;

    const content = await LearningContent.findByIdAndDelete(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Learning content not found",
      });
    }

    const topic = await Topic.findById(content.topicId);
    if (topic) {
      topic.hasLearningContent = false;
      await topic.save();
    }

    res.status(200).json({
      success: true,
      message: "Learning content deleted successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Delete learning content error:", error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete learning content",
      error: error.message,
    });
  }
}

export {
  getLearningContentByTopic,
  createLearningContent,
  updateLearningContent,
  publishLearningContent,
  unpublishLearningContent,
  deleteLearningContent,
};
