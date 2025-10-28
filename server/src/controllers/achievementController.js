import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import QuizSession from "../models/QuizSession.js";
import { AppError, catchAsync } from "../utils/AppError.js";

const getUserAchievements = catchAsync(async (req, res, next) => {
  const achievements = await UserAchievement.getUserUnlockedAchievements(
    req.user._id
  );

  res.json({
    success: true,
    data: { achievements },
  });
});

const getDisplayedAchievements = catchAsync(async (req, res, next) => {
  const achievements = await UserAchievement.getUserDisplayedAchievements(
    req.user._id
  );

  res.json({
    success: true,
    data: { achievements },
  });
});

const getAvailableAchievements = catchAsync(async (req, res, next) => {
  const achievements = await Achievement.getActiveAchievements();

  const userAchievements = await UserAchievement.find({ userId: req.user._id });

  const result = achievements.map((achievement) => {
    const userAchievement = userAchievements.find(
      (ua) => ua.achievementId.toString() === achievement._id.toString()
    );

    return {
      ...achievement.toObject(),
      isUnlocked: userAchievement?.unlockedAt ? true : false,
      progress: userAchievement?.progress || 0,
      progressPercentage: userAchievement?.progressPercentage || 0,
      unlockedAt: userAchievement?.unlockedAt,
    };
  });

  res.json({
    success: true,
    data: { achievements: result },
  });
});

const getAchievementsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;

  const validCategories = [
    "streak",
    "accuracy",
    "speed",
    "mastery",
    "consistency",
    "milestone",
    "special",
  ];

  if (!validCategories.includes(category)) {
    return next(new AppError("Invalid achievement category", 400));
  }

  const achievements = await Achievement.getAchievementsByCategory(category);

  const userAchievements = await UserAchievement.find({ userId: req.user._id });

  const result = achievements.map((achievement) => {
    const userAchievement = userAchievements.find(
      (ua) => ua.achievementId.toString() === achievement._id.toString()
    );

    return {
      ...achievement.toObject(),
      isUnlocked: userAchievement?.unlockedAt ? true : false,
      progress: userAchievement?.progress || 0,
      progressPercentage: userAchievement?.progressPercentage || 0,
      unlockedAt: userAchievement?.unlockedAt,
    };
  });

  res.json({
    success: true,
    data: { achievements: result },
  });
});

const checkNewAchievements = catchAsync(async (req, res, next) => {
  const unlockedAchievements = [];

  const stats = await QuizSession.getUserStats(req.user._id);
  const userStats = stats[0] || {};

  const allAchievements = await Achievement.getActiveAchievements();

  for (const achievement of allAchievements) {
    const userAchievement = await UserAchievement.getOrCreate(
      req.user._id,
      achievement._id
    );

    if (!userAchievement.unlockedAt && achievement.checkUnlock(userStats)) {
      await userAchievement.unlock();
      unlockedAchievements.push({
        achievement: achievement.toObject(),
        justUnlocked: true,
      });
    }
  }

  res.json({
    success: true,
    data: { newAchievements: unlockedAchievements },
  });
});

const toggleAchievementDisplay = catchAsync(async (req, res, next) => {
  const { achievementId } = req.params;

  const userAchievement = await UserAchievement.findOne({
    userId: req.user._id,
    achievementId,
  });

  if (!userAchievement) {
    return next(new AppError("Achievement not found", 404));
  }

  await userAchievement.toggleDisplay();

  res.json({
    success: true,
    data: { message: "Achievement display toggled successfully" },
  });
});

const getAchievementStats = catchAsync(async (req, res, next) => {
  const totalCount = await UserAchievement.countUserAchievements(req.user._id);

  const allAchievements = await Achievement.getActiveAchievements();

  const achievementCounts = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  allAchievements.forEach((ach) => {
    achievementCounts[ach.rarityLevel]++;
  });

  res.json({
    success: true,
    data: {
      totalUnlocked: totalCount,
      totalAvailable: allAchievements.length,
      unlockedPercentage:
        allAchievements.length > 0
          ? Math.round((totalCount / allAchievements.length) * 100)
          : 0,
      achievementCounts,
    },
  });
});

export default {
  getUserAchievements,
  getDisplayedAchievements,
  getAvailableAchievements,
  getAchievementsByCategory,
  checkNewAchievements,
  toggleAchievementDisplay,
  getAchievementStats,
};
