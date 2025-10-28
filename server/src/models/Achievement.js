import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "streak",
        "accuracy",
        "speed",
        "mastery",
        "consistency",
        "milestone",
        "special",
      ],
      required: true,
    },
    criteria: {
      type: {
        type: String,
        enum: [
          "streak",
          "accuracy",
          "completedQuizzes",
          "timeSpent",
          "perfectScores",
          "speedRuns",
        ],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      period: {
        type: String,
        enum: ["oneTime", "daily", "weekly", "monthly", "allTime"],
        default: "oneTime",
      },
    },
    pointsValue: {
      type: Number,
      default: 10,
    },
    rarityLevel: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({ name: 1 });
achievementSchema.index({ category: 1 });
achievementSchema.index({ isActive: 1 });

achievementSchema.methods.checkUnlock = function (userStats) {
  const { type, value } = this.criteria;

  switch (type) {
    case "streak":
      return userStats.currentStreak >= value;
    case "accuracy":
      return userStats.averageAccuracy >= value;
    case "completedQuizzes":
      return userStats.totalSessions >= value;
    case "timeSpent":
      return userStats.totalTimeSpent >= value;
    case "perfectScores":
      return userStats.perfectScores >= value;
    case "speedRuns":
      return userStats.speedRuns >= value;
    default:
      return false;
  }
};

achievementSchema.statics.getActiveAchievements = function () {
  return this.find({ isActive: true }).sort({ displayOrder: 1 });
};

achievementSchema.statics.getAchievementsByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ displayOrder: 1 });
};

export default mongoose.model("Achievement", achievementSchema);
