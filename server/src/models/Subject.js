import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "BookOpen",
    },
    examLevel: {
      type: String,
      enum: ["Professional", "Sub-Professional", "Both"],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subjectSchema.virtual("topics", {
  ref: "Topic",
  localField: "_id",
  foreignField: "subjectId",
});

subjectSchema.methods.updateTopicCount = async function () {
  const Topic = mongoose.model("Topic");
  this.totalTopics = await Topic.countDocuments({
    subjectId: this._id,
    isActive: true,
  });
  return this.save();
};

subjectSchema.methods.updateQuestionCount = async function () {
  const ManualQuestion = mongoose.model("ManualQuestion");
  this.totalQuestions = await ManualQuestion.countDocuments({
    subjectId: this._id,
    status: "approved",
  });
  return this.save();
};

subjectSchema.methods.getProgress = async function (userId) {
  const UserProgress = mongoose.model("UserProgress");
  return UserProgress.findOne({ userId, subjectId: this._id });
};

subjectSchema.statics.getByExamLevel = function (examLevel) {
  return this.find({
    isActive: true,
    isPublished: true,
    $or: [{ examLevel }, { examLevel: "Both" }],
  }).sort({ order: 1 });
};

subjectSchema.statics.getWithProgress = async function (userId, examLevel) {
  const subjects = await this.find({
    isActive: true,
    isPublished: true,
    $or: [{ examLevel }, { examLevel: "Both" }],
  })
    .sort({ order: 1 })
    .lean();

  const UserProgress = mongoose.model("UserProgress");
  const progressData = await UserProgress.find({
    userId,
    subjectId: { $in: subjects.map((s) => s._id) },
  });

  return subjects.map((subject) => {
    const progress = progressData.find(
      (p) => p.subjectId.toString() === subject._id.toString()
    );
    return {
      ...subject,
      progress: progress
        ? {
          completedTopics: progress.completedTopics.length,
          totalAttempts: progress.totalAttempts,
          averageScore: progress.averageScore,
          lastAccessedAt: progress.lastAccessedAt,
        }
        : null,
    };
  });
};

subjectSchema.index({ examLevel: 1, isActive: 1 });

subjectSchema.index({ order: 1 });

export default mongoose.model("Subject", subjectSchema);
