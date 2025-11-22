import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyActivity",
      required: true,
    },
    status: {
      type: String,
      enum: ["locked", "unlocked", "in_progress", "completed", "perfect"],
      default: "locked",
    },
    startedAt: Date,
    completedAt: Date,
    score: Number,
    maxScore: Number,
    timeSpent: Number,
    xpEarned: Number,
    countsForStreak: {
      type: Boolean,
      default: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "QuestionTemplate",
        },
        selectedAnswer: String,
        isCorrect: Boolean,
        timeSpent: Number,
        attemptNumber: Number,
      },
    ],
    mistakes: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "QuestionTemplate",
        },
        incorrectAnswer: String,
        correctAnswer: String,
        explanation: String,
        reviewedAt: Date,
      },
    ],
    notes: String,
  },
  {
    timestamps: true,
  }
);

userActivitySchema.index({ userId: 1, activityId: 1 });

export default mongoose.model("UserActivity", userActivitySchema);
