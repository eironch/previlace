import User from "../models/User.js";
import { catchAsync } from "../utils/AppError.js";

const getAdminStats = catchAsync(async (req, res) => {
  const baseQuery = { role: "user" };

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
  ] = await Promise.all([
    User.countDocuments(baseQuery),
    User.countDocuments({
      ...baseQuery,
      isProfileComplete: true,
      $or: [
        { studyMode: { $exists: true, $not: { $size: 0 } } },
        { struggles: { $exists: true, $not: { $size: 0 } } },
        { targetDate: { $ne: "" } },
      ],
    }),
    User.countDocuments({
      ...baseQuery,
      isProfileComplete: true,
    }),
    User.countDocuments({
      ...baseQuery,
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
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
  ]);

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
    },
  });
});

const getRecentUsers = catchAsync(async (req, res) => {
  const recentUsers = await User.find({ role: "user" })
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
  getAdminStats,
  getRecentUsers,
  getUserDetails,
};