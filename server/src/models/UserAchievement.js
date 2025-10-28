import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    unlockedAt: Date,
    isDisplayed: {
      type: Boolean,
      default: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, unlockedAt: -1 });
userAchievementSchema.index({ userId: 1, isDisplayed: 1 });

userAchievementSchema.methods.updateProgress = async function (currentValue, targetValue) {
  this.progress = currentValue;
  this.progressPercentage = Math.round((currentValue / targetValue) * 100);

  if (this.progressPercentage >= 100 && !this.unlockedAt) {
    this.unlockedAt = new Date();
  }

  return this.save();
};

userAchievementSchema.methods.unlock = function () {
  if (!this.unlockedAt) {
    this.unlockedAt = new Date();
    this.progressPercentage = 100;
    return this.save();
  }
  return this;
};

userAchievementSchema.methods.toggleDisplay = function () {
  this.isDisplayed = !this.isDisplayed;
  return this.save();
};

userAchievementSchema.statics.getOrCreate = async function (userId, achievementId) {
  let userAchievement = await this.findOne({ userId, achievementId });

  if (!userAchievement) {
    userAchievement = await this.create({
      userId,
      achievementId,
    });
  }

  return userAchievement;
};

userAchievementSchema.statics.getUserUnlockedAchievements = function (userId) {
  return this.find({ userId, unlockedAt: { $ne: null } })
    .populate("achievementId")
    .sort({ unlockedAt: -1 });
};

userAchievementSchema.statics.getUserDisplayedAchievements = function (userId) {
  return this.find({ userId, isDisplayed: true, unlockedAt: { $ne: null } })
    .populate("achievementId")
    .sort({ unlockedAt: -1 });
};

userAchievementSchema.statics.countUserAchievements = function (userId) {
  return this.countDocuments({ userId, unlockedAt: { $ne: null } });
};

export default mongoose.model("UserAchievement", userAchievementSchema);
