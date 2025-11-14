import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    estimatedMinutes: {
      type: Number,
      default: 30,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    hasLearningContent: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

topicSchema.virtual("subject", {
  ref: "Subject",
  localField: "subjectId",
  foreignField: "_id",
  justOne: true,
});

topicSchema.virtual("learningContent", {
  ref: "LearningContent",
  localField: "_id",
  foreignField: "topicId",
  justOne: true,
});

topicSchema.methods.updateQuestionCount = async function () {
  const ManualQuestion = mongoose.model("ManualQuestion");
  this.totalQuestions = await ManualQuestion.countDocuments({
    topicId: this._id,
    status: "approved",
  });
  return this.save();
};

topicSchema.methods.getProgress = async function (userId) {
  const UserProgress = mongoose.model("UserProgress");
  const progress = await UserProgress.findOne({
    userId,
    subjectId: this.subjectId,
  });
  if (progress && progress.topicProgress) {
    return progress.topicProgress.find(
      (tp) => tp.topicId.toString() === this._id.toString()
    );
  }
  return null;
};

topicSchema.statics.getBySubject = function (subjectId) {
  return this.find({ subjectId, isActive: true }).sort({ order: 1 });
};

topicSchema.statics.getWithProgress = async function (subjectId, userId) {
  const topics = await this.find({ subjectId, isActive: true })
    .sort({ order: 1 })
    .lean();

  const UserProgress = mongoose.model("UserProgress");
  const progress = await UserProgress.findOne({
    userId,
    subjectId,
  });

  return topics.map((topic) => {
    const topicProgress =
      progress &&
      progress.topicProgress &&
      progress.topicProgress.find(
        (tp) => tp.topicId.toString() === topic._id.toString()
      );

    return {
      ...topic,
      progress: topicProgress
        ? {
            isCompleted: topicProgress.isCompleted,
            attempts: topicProgress.attempts,
            bestScore: topicProgress.bestScore,
            lastAccessedAt: topicProgress.lastAccessedAt,
          }
        : null,
    };
  });
};

topicSchema.index({ subjectId: 1, isActive: 1 });
topicSchema.index({ code: 1 });
topicSchema.index({ order: 1 });

export default mongoose.model("Topic", topicSchema);
