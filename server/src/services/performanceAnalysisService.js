import QuizAttempt from "../models/QuizAttempt.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import ManualQuestion from "../models/ManualQuestion.js";
import mongoose from "mongoose";

class PerformanceAnalysisService {
  async calculateUserStatistics(userId) {
    const [overallStats, categoryStats, difficultyStats, recentTrends] = await Promise.all([
      this.getOverallStatistics(userId),
      this.getCategoryStatistics(userId),
      this.getDifficultyStatistics(userId),
      this.getRecentTrends(userId)
    ]);

    return {
      overall: overallStats,
      categories: categoryStats,
      difficulty: difficultyStats,
      trends: recentTrends,
      recommendations: this.generateRecommendations(categoryStats, difficultyStats)
    };
  }

  async getOverallStatistics(userId) {
    const stats = await QuizAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "completed"
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalQuestions: { $sum: "$score.total" },
          totalCorrect: { $sum: "$score.correct" },
          averageScore: { $avg: "$score.percentage" },
          bestScore: { $max: "$score.percentage" },
          totalTimeSpent: { $sum: "$timing.totalTimeSpent" },
          averageSessionTime: { $avg: "$timing.totalTimeSpent" }
        }
      }
    ]);

    const questionHistory = await UserQuestionHistory.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: null,
          uniqueQuestions: { $sum: 1 },
          masteredQuestions: {
            $sum: { $cond: [{ $eq: ["$masteryLevel", "mastered"] }, 1, 0] }
          },
          strugglingQuestions: {
            $sum: { $cond: [{ $eq: ["$masteryLevel", "struggling"] }, 1, 0] }
          }
        }
      }
    ]);

    return {
      ...stats[0],
      ...questionHistory[0],
      accuracy: stats[0] && stats[0].totalQuestions > 0 ? (stats[0].totalCorrect / stats[0].totalQuestions) * 100 : 0
    };
  }

  async getCategoryStatistics(userId) {
    return QuizAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "completed"
        }
      },
      { $unwind: "$analytics.categoryPerformance" },
      {
        $group: {
          _id: "$analytics.categoryPerformance.k",
          totalQuestions: { $sum: "$analytics.categoryPerformance.v.total" },
          correctAnswers: { $sum: "$analytics.categoryPerformance.v.correct" },
          averageAccuracy: { $avg: "$analytics.categoryPerformance.v.percentage" },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $project: {
          category: "$_id",
          totalQuestions: 1,
          correctAnswers: 1,
          accuracy: {
            $cond: [
              { $gt: ["$totalQuestions", 0] },
              { $multiply: [{ $divide: ["$correctAnswers", "$totalQuestions"] }, 100] },
              0
            ]
          },
          averageAccuracy: 1,
          sessionCount: 1,
          masteryLevel: {
            $switch: {
              branches: [
                { case: { $gte: ["$averageAccuracy", 90] }, then: "mastered" },
                { case: { $gte: ["$averageAccuracy", 75] }, then: "proficient" },
                { case: { $gte: ["$averageAccuracy", 60] }, then: "learning" }
              ],
              default: "struggling"
            }
          }
        }
      },
      { $sort: { accuracy: -1 } }
    ]);
  }

  async getDifficultyStatistics(userId) {
    return UserQuestionHistory.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: "manualquestions",
          localField: "questionId",
          foreignField: "_id",
          as: "question"
        }
      },
      { $unwind: "$question" },
      {
        $group: {
          _id: "$question.difficulty",
          totalAttempts: { $sum: "$totalAttempts" },
          correctAttempts: { $sum: "$correctAttempts" },
          averageTime: { $avg: "$averageResponseTime" },
          questionCount: { $sum: 1 }
        }
      },
      {
        $project: {
          difficulty: "$_id",
          totalAttempts: 1,
          correctAttempts: 1,
          accuracy: {
            $cond: [
              { $gt: ["$totalAttempts", 0] },
              { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] },
              0
            ]
          },
          averageTime: 1,
          questionCount: 1
        }
      },
      { $sort: { difficulty: 1 } }
    ]);
  }

  async getRecentTrends(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return QuizAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "completed",
          "timing.completedAt": { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timing.completedAt"
            }
          },
          sessionCount: { $sum: 1 },
          averageScore: { $avg: "$score.percentage" },
          totalQuestions: { $sum: "$score.total" },
          totalCorrect: { $sum: "$score.correct" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
  }

  async getExamReadinessScore(userId, examLevel = "professional") {
    const [categoryStats, recentPerformance, timeManagement] = await Promise.all([
      this.getCategoryStatistics(userId),
      this.getRecentPerformance(userId),
      this.getTimeManagementAnalysis(userId)
    ]);

    const categoryReadiness = this.calculateCategoryReadiness(categoryStats, examLevel);
    const performanceConsistency = this.calculateConsistency(recentPerformance);
    const timeEfficiency = this.calculateTimeEfficiency(timeManagement);

    const overallScore = Math.round(
      (categoryReadiness * 0.5) + 
      (performanceConsistency * 0.3) + 
      (timeEfficiency * 0.2)
    );

    return {
      overallScore,
      categoryReadiness,
      performanceConsistency,
      timeEfficiency,
      recommendations: this.generateReadinessRecommendations(overallScore, categoryStats),
      estimatedPassingProbability: this.calculatePassingProbability(overallScore)
    };
  }

  async getRecentPerformance(userId, sessionCount = 10) {
    return QuizAttempt.find({
      userId,
      status: "completed"
    })
    .sort({ "timing.completedAt": -1 })
    .limit(sessionCount)
    .select("score timing");
  }

  async getTimeManagementAnalysis(userId) {
    return QuizAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "completed"
        }
      },
      {
        $project: {
          questionsPerMinute: {
            $cond: [
              { $gt: ["$timing.totalTimeSpent", 0] },
              {
                $divide: [
                  "$score.total",
                  { $divide: ["$timing.totalTimeSpent", 60000] }
                ]
              },
              0
            ]
          },
          averageTimePerQuestion: "$analytics.averageTimePerQuestion"
        }
      },
      {
        $group: {
          _id: null,
          averageQuestionsPerMinute: { $avg: "$questionsPerMinute" },
          averageTimePerQuestion: { $avg: "$averageTimePerQuestion" }
        }
      }
    ]);
  }

  calculateCategoryReadiness(categoryStats, examLevel) {
    const requiredCategories = this.getRequiredCategories(examLevel);
    const passingThreshold = 75;

    const readyCategories = categoryStats.filter(cat => 
      requiredCategories.includes(cat.category) && cat.accuracy >= passingThreshold
    ).length;

    return requiredCategories.length > 0 ? Math.round((readyCategories / requiredCategories.length) * 100) : 0;
  }

  calculateConsistency(recentPerformance) {
    if (recentPerformance.length < 3) return 50;

    const scores = recentPerformance.map(p => p.score.percentage);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    const consistency = Math.max(0, 100 - standardDeviation * 2);
    return Math.round(consistency);
  }

  calculateTimeEfficiency(timeAnalysis) {
    if (!timeAnalysis[0] || !timeAnalysis[0].averageQuestionsPerMinute) return 50;

    const { averageQuestionsPerMinute } = timeAnalysis[0];
    const targetQuestionsPerMinute = 1.5;
    const efficiency = Math.min(100, (averageQuestionsPerMinute / targetQuestionsPerMinute) * 100);
    
    return Math.round(efficiency);
  }

  calculatePassingProbability(readinessScore) {
    if (readinessScore >= 85) return 95;
    if (readinessScore >= 75) return 80;
    if (readinessScore >= 65) return 65;
    if (readinessScore >= 55) return 45;
    return 25;
  }

  getRequiredCategories(examLevel) {
    const professionalCategories = [
      "General Information",
      "Numerical Reasoning", 
      "Analytical Reasoning",
      "Verbal Reasoning",
      "Clerical Operations"
    ];

    const subProfessionalCategories = [
      "Vocabulary",
      "Grammar and Correct Usage",
      "Paragraph Organization", 
      "Reading Comprehension",
      "Numerical Reasoning",
      "Clerical Operations"
    ];

    return examLevel === "professional" ? professionalCategories : subProfessionalCategories;
  }

  generateRecommendations(categoryStats, difficultyStats) {
    const recommendations = [];
    
    const weakCategories = categoryStats.filter(cat => cat.accuracy < 60);
    if (weakCategories.length > 0) {
      recommendations.push({
        type: "category_improvement",
        priority: "high",
        message: `Focus on improving ${weakCategories.map(c => c.category).join(", ")}`,
        categories: weakCategories.map(c => c.category)
      });
    }

    const difficultiesBelow50 = difficultyStats.filter(diff => diff.accuracy < 50);
    if (difficultiesBelow50.length > 0) {
      recommendations.push({
        type: "difficulty_focus",
        priority: "medium",
        message: `Practice more ${difficultiesBelow50.map(d => d.difficulty).join(" and ")} questions`,
        difficulties: difficultiesBelow50.map(d => d.difficulty)
      });
    }

    return recommendations;
  }

  generateReadinessRecommendations(overallScore, categoryStats) {
    const recommendations = [];

    if (overallScore < 70) {
      recommendations.push({
        type: "general",
        message: "Continue regular practice sessions to build consistency",
        timeframe: "4-6 weeks"
      });
    }

    const weakAreas = categoryStats.filter(cat => cat.accuracy < 70);
    if (weakAreas.length > 0) {
      recommendations.push({
        type: "focus_areas", 
        message: `Prioritize studying ${weakAreas.slice(0, 3).map(w => w.category).join(", ")}`,
        categories: weakAreas.map(w => w.category)
      });
    }

    return recommendations;
  }

  async identifyWeakAreas(userId) {
    const categoryStats = await this.getCategoryStatistics(userId);
    return categoryStats
      .filter(cat => cat.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .map(cat => ({
        category: cat.category,
        accuracy: cat.accuracy,
        questionsNeeded: Math.max(10, Math.round((70 - cat.accuracy) / 2))
      }));
  }

  async calculateCategoryStatistics(userId) {
    return this.getCategoryStatistics(userId);
  }

  async calculateExamReadiness(userId) {
    return this.getExamReadinessScore(userId);
  }

  async generateProgressReport(userId, days) {
    const [trends, stats, weakAreas] = await Promise.all([
      this.getRecentTrends(userId, days),
      this.getOverallStatistics(userId),
      this.identifyWeakAreas(userId)
    ]);

    return {
      trends,
      statistics: stats,
      weakAreas,
      period: `${days} days`,
      generatedAt: new Date()
    };
  }

  async getPercentileRank(userId, metric = "averageScore") {
    const userStats = await this.getOverallStatistics(userId);
    const userValue = userStats[metric] || 0;

    const allUserStats = await QuizAttempt.aggregate([
      {
        $match: { status: "completed" }
      },
      {
        $group: {
          _id: "$userId",
          averageScore: { $avg: "$score.percentage" },
          totalSessions: { $sum: 1 },
          totalQuestions: { $sum: "$score.total" },
          totalCorrect: { $sum: "$score.correct" }
        }
      },
      {
        $project: {
          userId: "$_id",
          averageScore: 1,
          totalSessions: 1,
          accuracy: {
            $cond: [
              { $gt: ["$totalQuestions", 0] },
              { $multiply: [{ $divide: ["$totalCorrect", "$totalQuestions"] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    const totalUsers = allUserStats.length;
    if (totalUsers === 0) {
      return { percentile: 50, rank: 1, totalUsers: 1 };
    }

    const usersBelow = allUserStats.filter(user => user[metric] < userValue).length;
    const percentile = totalUsers > 1 ? Math.round((usersBelow / (totalUsers - 1)) * 100) : 50;

    return {
      percentile,
      rank: totalUsers - usersBelow,
      totalUsers,
      userValue
    };
  }
}

export default new PerformanceAnalysisService();
