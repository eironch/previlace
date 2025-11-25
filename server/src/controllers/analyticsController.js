import mongoose from "mongoose";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { AppError } from "../utils/AppError.js";
import UserActivity from "../models/UserActivity.js";
import DailyActivity from "../models/DailyActivity.js";

async function getCategoryStatistics(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const stats = await UserQuestionHistory.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$subject",
          totalAttempts: { $sum: "$totalAttempts" },
          correctAttempts: { $sum: "$correctAttempts" },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      { $unwind: "$subjectInfo" },
      {
        $project: {
          category: "$subjectInfo.name", // Renamed from subjectName to category
          totalQuestions: "$totalAttempts",
          accuracy: {
            $cond: [
              { $eq: ["$totalAttempts", 0] },
              0,
              { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }
            ]
          },
          percentage: { // Added percentage for charts
            $cond: [
              { $eq: ["$totalAttempts", 0] },
              0,
              { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }
            ]
          },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    next(error);
  }
}

async function getWeakAreas(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const weakAreas = await UserQuestionHistory.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$topic",
          totalAttempts: { $sum: "$totalAttempts" },
          correctAttempts: { $sum: "$correctAttempts" },
        },
      },
      {
        $project: {
          accuracy: {
            $round: [
              {
                $cond: [
                  { $eq: ["$totalAttempts", 0] },
                  0,
                  { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }
                ]
              },
              2
            ]
          },
          totalQuestions: "$totalAttempts",
        },
      },
      { $match: { accuracy: { $lt: 60 }, totalQuestions: { $gte: 5 } } },
      { $sort: { accuracy: 1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "topics",
          localField: "_id",
          foreignField: "_id",
          as: "topicInfo",
        },
      },
      { $unwind: "$topicInfo" },
      {
        $project: {
          topicName: "$topicInfo.name",
          accuracy: 1,
          totalQuestions: 1,
        },
      },
    ]);

    res.json(weakAreas);
  } catch (error) {
    next(error);
  }
}

async function getExamReadiness(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // Cast to ObjectId
    const history = await UserQuestionHistory.find({ userId: userId });
    
    let totalAttempts = 0;
    let correctAttempts = 0;
    
    history.forEach(h => {
        totalAttempts += h.totalAttempts;
        correctAttempts += h.correctAttempts;
    });

    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    const uniqueQuestions = history.length;

    let readiness = "Low";
    if (accuracy >= 80 && uniqueQuestions > 100) readiness = "High";
    else if (accuracy >= 60 && uniqueQuestions > 50) readiness = "Medium";

    res.json({
      readiness,
      accuracy: Math.round(accuracy),
      totalQuestions: uniqueQuestions,
    });
  } catch (error) {
    next(error);
  }
}

async function getProgressReport(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyProgress = await UserQuestionHistory.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$attempts" },
      {
        $match: {
          "attempts.answeredAt": { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$attempts.answeredAt" } },
          questionsAnswered: { $sum: 1 },
          correctAnswers: {
            $sum: { $cond: [{ $eq: ["$attempts.isCorrect", true] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(dailyProgress);
  } catch (error) {
    next(error);
  }
}

async function getPercentileRank(req, res, next) {
  try {
    const userId = req.user.id;
    res.json({ percentile: 75 }); 
  } catch (error) {
    next(error);
  }
}

async function getStudentAnalytics(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [categories, weakAreas, progress] = await Promise.all([
      UserQuestionHistory.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: "$subject",
            totalAttempts: { $sum: "$totalAttempts" },
            correctAttempts: { $sum: "$correctAttempts" },
          },
        },
        {
          $lookup: { from: "subjects", localField: "_id", foreignField: "_id", as: "subjectInfo" },
        },
        { $unwind: "$subjectInfo" },
        {
          $project: {
            category: "$subjectInfo.name",
            accuracy: {
                $cond: [
                  { $eq: ["$totalAttempts", 0] },
                  0,
                  { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }
                ]
            },
            percentage: {
                $cond: [
                  { $eq: ["$totalAttempts", 0] },
                  0,
                  { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }
                ]
            }
          },
        },
      ]),
      UserQuestionHistory.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: "$topic",
            totalAttempts: { $sum: "$totalAttempts" },
            correctAttempts: { $sum: "$correctAttempts" },
          },
        },
        {
          $project: {
            accuracy: {
              $round: [
                {
                  $cond: [
                    { $eq: ["$totalAttempts", 0] },
                    0,
                    { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }
                  ]
                },
                2
              ]
            },
            totalQuestions: "$totalAttempts",
          },
        },
        { $match: { accuracy: { $lt: 60 }, totalQuestions: { $gte: 5 } } },
        { $sort: { accuracy: 1 } },
        { $limit: 5 },
        {
          $lookup: { from: "topics", localField: "_id", foreignField: "_id", as: "topicInfo" },
        },
        { $unwind: "$topicInfo" },
        {
          $project: { topicName: "$topicInfo.name", accuracy: 1 },
        },
      ]),
      UserQuestionHistory.aggregate([
        { $match: { userId: userId } },
        { $unwind: "$attempts" },
        {
          $match: {
            "attempts.answeredAt": { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$attempts.answeredAt" } },
            questionsAnswered: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const history = await UserQuestionHistory.find({ userId: userId });
    let totalAttempts = 0;
    let correctAttempts = 0;
    history.forEach(h => {
        totalAttempts += h.totalAttempts;
        correctAttempts += h.correctAttempts;
    });
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    let readiness = "Low";
    if (accuracy >= 80 && totalAttempts > 100) readiness = "High";
    else if (accuracy >= 60 && totalAttempts > 50) readiness = "Medium";

    const overallProgress = await UserActivity.aggregate([
      { $match: { userId: userId, status: { $in: ["completed", "perfect"] } } },
      {
        $lookup: {
          from: "dailyactivities",
          localField: "activityId",
          foreignField: "_id",
          as: "activityInfo",
        },
      },
      { $unwind: "$activityInfo" },
      {
        $group: {
          _id: "$activityInfo.weekNumber",
          averageScore: { $sum: "$score" },
          maxScore: { $sum: "$maxScore" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          week: { $concat: ["Week ", { $toString: "$_id" }] },
          score: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$averageScore", "$maxScore"] },
                  100
                ]
              },
              2
            ]
          },
          _id: 0,
        },
      },
    ]);

    const subjects = await Subject.find({ isActive: true });
    const subjectWeeklyProgress = {};

    for (const subject of subjects) {
      const progress = await UserActivity.aggregate([
        { $match: { userId: userId, status: { $in: ["completed", "perfect"] } } },
        {
          $lookup: {
            from: "dailyactivities",
            localField: "activityId",
            foreignField: "_id",
            as: "activityInfo",
          },
        },
        { $unwind: "$activityInfo" },
        { $match: { "activityInfo.subjectId": subject._id } },
        {
          $group: {
            _id: "$activityInfo.weekNumber",
            averageScore: { $sum: "$score" },
            maxScore: { $sum: "$maxScore" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            week: { $concat: ["Week ", { $toString: "$_id" }] },
            score: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$averageScore", "$maxScore"] },
                    100
                  ]
                },
                2
              ]
            },
            _id: 0,
          },
        },
      ]);

      if (progress.length > 0) {
        subjectWeeklyProgress[subject.name] = progress;
      }
    }

    res.json({
      categories: categories,
      weakAreas: weakAreas,
      totalQuestions: totalAttempts,
      accuracy: Math.round(accuracy),
      readiness: readiness,
      recentProgress: progress,
      overallProgress: overallProgress,
      subjectWeeklyProgress: subjectWeeklyProgress,
    });
  } catch (error) {
    next(error);
  }
}

async function getWeeklyProgress(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const weeklyProgress = await UserActivity.aggregate([
      { $match: { userId: userId, status: { $in: ["completed", "perfect"] } } },
      {
        $lookup: {
          from: "dailyactivities",
          localField: "activityId",
          foreignField: "_id",
          as: "activityInfo",
        },
      },
      { $unwind: "$activityInfo" },
      {
        $group: {
          _id: "$activityInfo.weekNumber",
          averageScore: { $sum: "$score" },
          maxScore: { $sum: "$maxScore" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          week: { $concat: ["Week ", { $toString: "$_id" }] },
          score: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$averageScore", "$maxScore"] },
                  100
                ]
              },
              2
            ]
          },
          _id: 0,
        },
      },
    ]);

    res.json(weeklyProgress);
  } catch (error) {
    next(error);
  }
}

async function getSubjectWeeklyProgress(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const subjects = await Subject.find({ isActive: true });
    const subjectProgress = {};

    for (const subject of subjects) {
      const progress = await UserActivity.aggregate([
        { $match: { userId: userId, status: { $in: ["completed", "perfect"] } } },
        {
          $lookup: {
            from: "dailyactivities",
            localField: "activityId",
            foreignField: "_id",
            as: "activityInfo",
          },
        },
        { $unwind: "$activityInfo" },
        { $match: { "activityInfo.subjectId": subject._id } },
        {
          $group: {
            _id: "$activityInfo.weekNumber",
            averageScore: { $sum: "$score" },
            maxScore: { $sum: "$maxScore" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            week: { $concat: ["Week ", { $toString: "$_id" }] },
            score: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$averageScore", "$maxScore"] },
                    100
                  ]
                },
                2
              ]
            },
            _id: 0,
          },
        },
      ]);

      if (progress.length > 0) {
        subjectProgress[subject.name] = progress;
      }
    }

    res.json(subjectProgress);
  } catch (error) {
    next(error);
  }
}

export default {
  getCategoryStatistics,
  getWeakAreas,
  getExamReadiness,
  getProgressReport,
  getPercentileRank,
  getStudentAnalytics,
  getWeeklyProgress,
  getSubjectWeeklyProgress,
};
