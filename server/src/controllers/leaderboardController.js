import LeaderboardEntry from "../models/LeaderboardEntry.js";
import QuizSession from "../models/QuizSession.js";
import { AppError, catchAsync } from "../utils/AppError.js";

const getLeaderboard = catchAsync(async (req, res, next) => {
  const { category = "overall", limit = 100, page = 1 } = req.query;

  const validCategories = [
    "overall",
    "weekly",
    "monthly",
    "daily",
    "category-specific",
  ];

  if (!validCategories.includes(category)) {
    return next(new AppError("Invalid category", 400));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const entries = await LeaderboardEntry.find({ category })
    .populate("userId", "firstName lastName avatar")
    .sort({ points: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await LeaderboardEntry.countDocuments({ category });

  res.json({
    success: true,
    data: {
      entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    },
  });
});

const getUserRank = catchAsync(async (req, res, next) => {
  const { category = "overall" } = req.query;

  const validCategories = [
    "overall",
    "weekly",
    "monthly",
    "daily",
    "category-specific",
  ];

  if (!validCategories.includes(category)) {
    return next(new AppError("Invalid category", 400));
  }

  const userEntry = await LeaderboardEntry.findOne({
    userId: req.user._id,
    category,
  }).populate("userId", "firstName lastName avatar");

  if (!userEntry) {
    return res.json({
      success: true,
      data: { rank: null, message: "User not ranked yet" },
    });
  }

  const rankInfo = await LeaderboardEntry.getUserRank(req.user._id, category);

  res.json({
    success: true,
    data: {
      rank: userEntry.rank,
      points: userEntry.points,
      percentile: rankInfo.percentile,
      totalUsers: rankInfo.totalUsers,
    },
  });
});

const getTopUsers = catchAsync(async (req, res, next) => {
  const { category = "overall", limit = 10 } = req.query;

  const validCategories = [
    "overall",
    "weekly",
    "monthly",
    "daily",
    "category-specific",
  ];

  if (!validCategories.includes(category)) {
    return next(new AppError("Invalid category", 400));
  }

  const topUsers = await LeaderboardEntry.getTopUsers(category, parseInt(limit));

  res.json({
    success: true,
    data: { topUsers },
  });
});

const getNearbyUsers = catchAsync(async (req, res, next) => {
  const { category = "overall", range = 5 } = req.query;

  const validCategories = [
    "overall",
    "weekly",
    "monthly",
    "daily",
    "category-specific",
  ];

  if (!validCategories.includes(category)) {
    return next(new AppError("Invalid category", 400));
  }

  const nearbyUsers = await LeaderboardEntry.getNearbyUsers(
    req.user._id,
    category,
    parseInt(range)
  );

  if (nearbyUsers.length === 0) {
    return res.json({
      success: true,
      data: { nearbyUsers: [], message: "User not ranked yet" },
    });
  }

  res.json({
    success: true,
    data: { nearbyUsers },
  });
});

async function calculateUserPoints(userId) {
  const sessions = await QuizSession.find({
    userId,
    status: "completed",
  });

  let points = 0;

  sessions.forEach((session) => {
    const basePoints = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    }[session.questions[0]?.difficulty] || 2;

    points += session.score.correct * basePoints;
  });

  return points;
}

const updateUserLeaderboard = catchAsync(async (req, res, next) => {
  const categories = ["overall", "weekly", "monthly", "daily"];

  for (const category of categories) {
    const entry = await LeaderboardEntry.getOrCreate(req.user._id, category);

    const points = await calculateUserPoints(req.user._id);

    const stats = await QuizSession.getUserStats(req.user._id);
    const userStats = stats[0] || {};

    await entry.updateEntry({
      points,
      sessionsCompleted: userStats.totalSessions || 0,
      averageScore: userStats.averageScore || 0,
      totalTimeSpent: userStats.totalTimeSpent || 0,
    });

    await LeaderboardEntry.updateRanks(category);
  }

  res.json({
    success: true,
    data: { message: "Leaderboard updated successfully" },
  });
});

const getCategoryLeaderboard = catchAsync(async (req, res, next) => {
  const { categoryName, limit = 50, page = 1 } = req.query;

  if (!categoryName) {
    return next(new AppError("Category name is required", 400));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const entries = await LeaderboardEntry.find({
    category: "category-specific",
    categoryName,
  })
    .populate("userId", "firstName lastName avatar")
    .sort({ points: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await LeaderboardEntry.countDocuments({
    category: "category-specific",
    categoryName,
  });

  res.json({
    success: true,
    data: {
      entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    },
  });
});

export default {
  getLeaderboard,
  getUserRank,
  getTopUsers,
  getNearbyUsers,
  updateUserLeaderboard,
  getCategoryLeaderboard,
};
