import mongoose from "mongoose";

const topicProgressSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  bestScore: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  lastScore: {
    type: Number,
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  hasViewedContent: {
    type: Boolean,
    default: false,
  },
  contentViewedAt: Date,
});

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    topicProgress: [topicProgressSchema],
    completedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    weakTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    strongTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userProgressSchema.methods.updateTopicProgress = function (
  topicId,
  score,
  totalQuestions,
  correctAnswers,
  hasViewedContent = false
) {
  const existing = this.topicProgress.find(
    (tp) => tp.topicId.toString() === topicId.toString()
  );

  if (existing) {
    existing.attempts += 1;
    existing.lastScore = score;
    existing.bestScore = Math.max(existing.bestScore, score);
    existing.totalQuestions += totalQuestions;
    existing.correctAnswers += correctAnswers;
    existing.lastAccessedAt = new Date();

    if (score >= 70 && !existing.isCompleted) {
      existing.isCompleted = true;
      if (!this.completedTopics.includes(topicId)) {
        this.completedTopics.push(topicId);
      }
    }
  } else {
    this.topicProgress.push({
      topicId,
      attempts: 1,
      bestScore: score,
      lastScore: score,
      totalQuestions,
      correctAnswers,
      isCompleted: score >= 70,
      lastAccessedAt: new Date(),
      hasViewedContent,
    });

    if (score >= 70) {
      this.completedTopics.push(topicId);
    }
  }

  this.totalAttempts += 1;
  this.lastAccessedAt = new Date();
  this.calculateAverageScore();
  this.identifyWeakAndStrongTopics();

  return this.save();
};

userProgressSchema.methods.markContentViewed = function (topicId) {
  const existing = this.topicProgress.find(
    (tp) => tp.topicId.toString() === topicId.toString()
  );

  if (existing) {
    existing.hasViewedContent = true;
    existing.contentViewedAt = new Date();
  } else {
    this.topicProgress.push({
      topicId,
      hasViewedContent: true,
      contentViewedAt: new Date(),
      lastAccessedAt: new Date(),
    });
  }

  return this.save();
};

userProgressSchema.methods.calculateAverageScore = function () {
  if (this.topicProgress.length === 0) {
    this.averageScore = 0;
    return;
  }

  const totalScore = this.topicProgress.reduce(
    (sum, tp) => sum + (tp.lastScore || 0),
    0
  );
  this.averageScore = Math.round(totalScore / this.topicProgress.length);
  this.bestScore = Math.max(
    ...this.topicProgress.map((tp) => tp.bestScore || 0),
    0
  );
};

userProgressSchema.methods.identifyWeakAndStrongTopics = function () {
  this.weakTopics = this.topicProgress
    .filter((tp) => tp.attempts > 0 && tp.bestScore < 50)
    .map((tp) => tp.topicId);

  this.strongTopics = this.topicProgress
    .filter((tp) => tp.attempts > 0 && tp.bestScore >= 80)
    .map((tp) => tp.topicId);
};

userProgressSchema.statics.getUserSubjectProgress = function (
  userId,
  subjectId
) {
  return this.findOne({ userId, subjectId });
};

userProgressSchema.statics.getAllUserProgress = function (userId) {
  return this.find({ userId }).populate("subjectId");
};

userProgressSchema.statics.getOrCreate = async function (userId, subjectId) {
  let progress = await this.findOne({ userId, subjectId });

  if (!progress) {
    progress = await this.create({
      userId,
      subjectId,
      topicProgress: [],
      completedTopics: [],
    });
  }

  return progress;
};

userProgressSchema.index({ userId: 1, subjectId: 1 }, { unique: true });
userProgressSchema.index({ lastAccessedAt: -1 });

export default mongoose.model("UserProgress", userProgressSchema);
