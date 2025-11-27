import User from "../models/User.js";
import QuizSession from "../models/QuizSession.js";
import DailyActivity from "../models/DailyActivity.js";
import UserActivity from "../models/UserActivity.js";
import { catchAsync } from "../utils/AppError.js";

const getDashboardStats = catchAsync(async (req, res) => {
  const baseQuery = { role: "student" };

  const [
    totalUsers,
    activeLearners,
    completedProfiles,
    activeStudents,
    examTypeStats,
    educationStats,
    strugglesStats,
    studyModeStats,
    monthlyRegistrations,
    categoryStats,
    activityStats,
    userRetentionStats,
  ] = await Promise.all([
    User.countDocuments(baseQuery),
    User.countDocuments({
      ...baseQuery,
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    User.countDocuments({
      ...baseQuery,
      isProfileComplete: true,
    }),
    // Active Students (Completed at least one quiz session in last 30 days)
    QuizSession.distinct("userId", {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status: "completed"
    }).then(ids => ids.length),
    User.aggregate([
      { $match: baseQuery },
      { $match: { examType: { $ne: "" } } },
      { $group: { _id: "$examType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    User.aggregate([
      { $match: { ...baseQuery, education: { $ne: "" } } },
      { $group: { _id: "$education", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    User.aggregate([
      { $match: baseQuery },
      { $match: { struggles: { $exists: true, $not: { $size: 0 } } } },
      { $unwind: "$struggles" },
      { $group: { _id: "$struggles", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    User.aggregate([
      { $match: baseQuery },
      { $match: { studyMode: { $exists: true, $not: { $size: 0 } } } },
      { $unwind: "$studyMode" },
      { $group: { _id: "$studyMode", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    User.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]),
    // Category Performance
    QuizSession.aggregate([
       { $match: { status: "completed" } },
       { $unwind: "$answers" },
       { 
         $lookup: {
           from: "manualquestions",
           localField: "answers.questionId",
           foreignField: "_id",
           as: "question"
         }
       },
       { $unwind: "$question" },
       {
         $group: {
           _id: "$question.category",
           totalQuestions: { $sum: 1 },
           correctQuestions: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } }
         }
       },
       {
         $project: {
           avgScore: { $multiply: [{ $divide: ["$correctQuestions", "$totalQuestions"] }, 100] }
         }
       },
       { $sort: { avgScore: -1 } }
    ]),
    // Activity by Hour (Learning Patterns)
    UserActivity.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // User Retention (Daily Active Users - Last 30 Days)
    UserActivity.aggregate([
      { 
        $match: { 
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
        } 
      },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          users: { $addToSet: "$userId" }
        }
      },
      { 
        $project: {
          date: "$_id",
          count: { $size: "$users" }
        }
      },
      { $sort: { date: 1 } }
    ]),
  ]);

  // Calculate System Health Metrics
  const start = Date.now();
  await User.findOne().select("_id"); // Quick query
  const dbLatency = Date.now() - start;

  const systemHealth = {
    api: { status: "Operational", uptime: process.uptime() },
    database: { status: "Operational", latency: dbLatency }
  };

  // Process Activity by Hour
  const activityByHour = Array(24).fill(0);
  activityStats.forEach((item) => {
    if (item._id >= 0 && item._id < 24) {
      activityByHour[item._id] = item.count;
    }
  });

  const overview = {
    totalUsers,
    activeLearners,
    completedProfiles,
    activeStudents,
    learnerRate:
      totalUsers > 0 ? Math.round((activeLearners / totalUsers) * 100) : 0,
    completionRate:
      totalUsers > 0
        ? Math.round((completedProfiles / totalUsers) * 100)
        : 0,
    activityRate:
      totalUsers > 0 ? Math.round((activeStudents / totalUsers) * 100) : 0,
  };

  res.json({
    success: true,
    data: {
      overview,
      examTypes: examTypeStats,
      education: educationStats,
      struggles: strugglesStats,
      studyModes: studyModeStats,
      monthlyRegistrations,
      categoryStats: categoryStats || [],
      learningPatterns: {
        activityByHour,
      },
      userRetention: userRetentionStats || [],
      systemHealth
    },
  });
});

const getAnalyticsStats = catchAsync(async (req, res) => {
  const [
    performanceStats,
    activityStats,
    userRetentionStats,
    quizCompletionStats,
    quizDurationStats,
    categoryStats,
  ] = await Promise.all([
    // Performance Stats
    QuizSession.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score.percentage" },
          avgTime: { $avg: "$timing.totalTimeSpent" },
          totalSessions: { $sum: 1 },
          passedSessions: { $sum: { $cond: [{ $gte: ["$score.percentage", 75] }, 1, 0] } }
         }
       },
       {
         $project: {
           avgScore: 1,
           avgTime: 1,
           totalSessions: 1,
           passedSessions: 1
         }
       }
    ]),
    // Activity by Hour (Learning Patterns)
    UserActivity.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // User Retention (Daily Active Users - Last 30 Days)
    UserActivity.aggregate([
      { 
        $match: { 
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
        } 
      },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          users: { $addToSet: "$userId" }
        }
      },
      { 
        $project: {
          date: "$_id",
          count: { $size: "$users" }
        }
      },
      { $sort: { date: 1 } }
    ]),
    // Quiz Completion Stats
    QuizSession.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    // Quiz Duration Stats (0-5m, 5-10m, 10-20m, 20m+)
    QuizSession.aggregate([
      { $match: { status: "completed" } },
      {
        $bucket: {
          groupBy: "$timing.totalTimeSpent",
          boundaries: [0, 300000, 600000, 1200000], // 0-5m, 5-10m, 10-20m
          default: 1200001, // 20m+
          output: { count: { $sum: 1 } }
        }
      }
    ]),
    // Category Performance
    QuizSession.aggregate([
       { $match: { status: "completed" } },
       { $unwind: "$answers" },
       { 
         $lookup: {
           from: "manualquestions",
           localField: "answers.questionId",
           foreignField: "_id",
           as: "question"
         }
       },
       { $unwind: "$question" },
       {
         $group: {
           _id: "$question.category",
           totalQuestions: { $sum: 1 },
           correctQuestions: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } }
         }
       },
       {
         $project: {
           avgScore: { $multiply: [{ $divide: ["$correctQuestions", "$totalQuestions"] }, 100] }
         }
       },
       { $sort: { avgScore: -1 } }
    ]),
  ]);

  // Process Performance Stats
  const perfStats = performanceStats[0] || {
    avgScore: 0,
    avgTime: 0,
    totalSessions: 0,
    passedSessions: 0,
  };
  const passRate =
    perfStats.totalSessions > 0
      ? Math.round((perfStats.passedSessions / perfStats.totalSessions) * 100)
      : 0;

  // Process Activity by Hour
  const activityByHour = Array(24).fill(0);
  activityStats.forEach((item) => {
    if (item._id >= 0 && item._id < 24) {
      activityByHour[item._id] = item.count;
    }
  });

  res.json({
    success: true,
    data: {
      categoryStats: categoryStats || [],
      performance: {
        avgScore: Math.round(perfStats.avgScore || 0),
        avgTime: Math.round((perfStats.avgTime || 0) / 1000 / 60), // Convert ms to minutes
        passRate,
        totalSessions: perfStats.totalSessions
      },
      learningPatterns: {
        activityByHour,
      },
      userRetention: userRetentionStats || [],
      quizStats: {
        completion: quizCompletionStats || [],
        duration: quizDurationStats || []
      }
    },
  });
});

const getRecentUsers = catchAsync(async (req, res) => {
  const recentUsers = await User.find({ role: "student" })
    .select(
      "firstName lastName email createdAt isProfileComplete examType lastLogin",
    )
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: {
      users: recentUsers || [],
      count: recentUsers?.length || 0,
    },
  });
});

const getUserDetails = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -refreshTokens")
    .lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: { user },
  });
});

export default {
  getDashboardStats,
  getAnalyticsStats,
  getRecentUsers,
  getUserDetails,
};
