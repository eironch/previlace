import mongoose from "mongoose";

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
    },
    freezesAvailable: {
      type: Number,
      default: 0,
    },
    freezeUsedDates: [
      {
        type: Date,
      },
    ],
    recoveryWindowEnd: {
      type: Date,
    },
    totalActivitiesCompleted: {
      type: Number,
      default: 0,
    },
    milestones: [
      {
        days: Number,
        achievedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Streak", streakSchema);
