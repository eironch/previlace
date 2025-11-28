import mongoose from "mongoose";

const postTestTrackingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

postTestTrackingSchema.index({ userId: 1, weekNumber: 1 }, { unique: true });

postTestTrackingSchema.statics.hasCompletedPostTest = async function (userId, weekNumber) {
  const record = await this.findOne({ userId, weekNumber, completed: true });
  return !!record;
};

postTestTrackingSchema.statics.markPostTestCompleted = async function (userId, weekNumber, sessionId, score) {
  return this.findOneAndUpdate(
    { userId, weekNumber },
    {
      sessionId,
      completed: true,
      completedAt: new Date(),
      score,
    },
    { upsert: true, new: true }
  );
};

postTestTrackingSchema.statics.getUserPostTestStatus = async function (userId) {
  return this.find({ userId }).sort({ weekNumber: 1 });
};

export default mongoose.model("PostTestTracking", postTestTrackingSchema);
