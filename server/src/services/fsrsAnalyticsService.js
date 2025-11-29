import UserQuestionHistory from "../models/UserQuestionHistory.js";
import UserBehaviorProfile from "../models/UserBehaviorProfile.js";
import QuizSessionBehavior from "../models/QuizSessionBehavior.js";
import ManualQuestion from "../models/ManualQuestion.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import fsrsService from "./fsrsService.js";

const fsrsAnalyticsService = {
  async getRetentionCurveData() {
    const histories = await UserQuestionHistory.find({
      lastReviewedAt: { $exists: true },
    }).limit(10000);

    const now = new Date();
    const predicted = [];
    const actual = [];

    const dayBuckets = [0, 1, 3, 7, 14, 30, 60, 90];

    for (const day of dayBuckets) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - day);

      let predictedSum = 0;
      let actualCorrect = 0;
      let count = 0;

      histories.forEach((h) => {
        if (!h.lastReviewedAt) return;
        const reviewDate = new Date(h.lastReviewedAt);
        const daysSinceReview = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));

        if (Math.abs(daysSinceReview - day) <= 1) {
          const predictedRetention = fsrsService.getRetrievability(h, now);
          predictedSum += predictedRetention;

          if (h.state === "review" || h.state === "learning") {
            actualCorrect += h.lapses === 0 ? 1 : 0.5;
          }
          count++;
        }
      });

      if (count > 0) {
        predicted.push({
          day,
          retention: Math.round((predictedSum / count) * 100),
        });
        actual.push({
          day,
          retention: Math.round((actualCorrect / count) * 100),
        });
      }
    }

    return { predicted, actual };
  },

  async getUserOptimizationStats() {
    const profiles = await UserBehaviorProfile.find({
      totalQuizzesTaken: { $gte: 1 },
    }).select("optimalRetention lastOptimizedAt personalizedWeights userId");

    const totalUsers = profiles.length;
    const optimizedUsers = profiles.filter((p) => p.lastOptimizedAt).length;
    const pendingOptimization = totalUsers - optimizedUsers;

    const retentionTargets = {
      "0.85-0.87": 0,
      "0.88-0.90": 0,
      "0.91-0.93": 0,
      "0.94+": 0,
    };

    profiles.forEach((p) => {
      const ret = p.optimalRetention || 0.9;
      if (ret < 0.88) retentionTargets["0.85-0.87"]++;
      else if (ret < 0.91) retentionTargets["0.88-0.90"]++;
      else if (ret < 0.94) retentionTargets["0.91-0.93"]++;
      else retentionTargets["0.94+"]++;
    });

    const lastBatchOptimized = profiles
      .filter((p) => p.lastOptimizedAt)
      .sort((a, b) => new Date(b.lastOptimizedAt) - new Date(a.lastOptimizedAt))[0]?.lastOptimizedAt;

    return {
      totalUsers,
      optimizedUsers,
      pendingOptimization,
      retentionTargets,
      lastBatchOptimized,
    };
  },

  async getWorkloadProjection(days = 7) {
    const histories = await UserQuestionHistory.find({
      nextReviewDate: { $exists: true },
    });

    const now = new Date();
    const projection = [];

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + i);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      let dueCount = 0;
      histories.forEach((h) => {
        if (h.nextReviewDate) {
          const dueDate = new Date(h.nextReviewDate);
          if (dueDate >= startOfDay && dueDate <= endOfDay) dueCount++;
        }
      });

      projection.push({
        day: i,
        date: startOfDay.toISOString().split("T")[0],
        dayName: new Date(startOfDay).toLocaleDateString("en-US", { weekday: "short" }),
        dueReviews: dueCount,
      });
    }

    const avgDue = projection.reduce((sum, p) => sum + p.dueReviews, 0) / projection.length;
    const trend = projection[projection.length - 1].dueReviews > projection[0].dueReviews ? "increasing" : "stable";

    return { projection, avgDue: Math.round(avgDue), trend };
  },

  async getAccuracyMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const histories = await UserQuestionHistory.find({
      lastReviewedAt: { $gte: thirtyDaysAgo },
    });

    if (histories.length === 0) {
      return { predicted: 0, actual: 0, deviation: 0, sampleSize: 0 };
    }

    const now = new Date();
    let predictedSum = 0;
    let actualSum = 0;

    histories.forEach((h) => {
      const predicted = fsrsService.getRetrievability(h, now);
      predictedSum += predicted;

      const wasCorrect = h.lapses === 0 || h.state === "review";
      actualSum += wasCorrect ? 1 : 0;
    });

    const predicted = Math.round((predictedSum / histories.length) * 100);
    const actual = Math.round((actualSum / histories.length) * 100);
    const deviation = Math.abs(predicted - actual);

    return {
      predicted,
      actual,
      deviation,
      sampleSize: histories.length,
    };
  },

  async getParameterDistribution() {
    const profiles = await UserBehaviorProfile.find({
      optimalRetention: { $exists: true },
    }).select("optimalRetention");

    const distribution = [];
    const buckets = [
      { min: 0.7, max: 0.8, label: "70-80%" },
      { min: 0.8, max: 0.85, label: "80-85%" },
      { min: 0.85, max: 0.9, label: "85-90%" },
      { min: 0.9, max: 0.95, label: "90-95%" },
      { min: 0.95, max: 1.0, label: "95-100%" },
    ];

    buckets.forEach((bucket) => {
      const count = profiles.filter(
        (p) => p.optimalRetention >= bucket.min && p.optimalRetention < bucket.max
      ).length;
      distribution.push({
        label: bucket.label,
        count,
        percentage: profiles.length > 0 ? Math.round((count / profiles.length) * 100) : 0,
      });
    });

    return distribution;
  },

  async getFSRSHealthSummary() {
    const [accuracy, optimization, workload, retention] = await Promise.all([
      this.getAccuracyMetrics(),
      this.getUserOptimizationStats(),
      this.getWorkloadProjection(7),
      this.getRetentionCurveData(),
    ]);

    return {
      accuracy,
      userOptimization: optimization,
      workloadProjection: workload,
      retentionCurve: retention,
    };
  },

  async getContentEffectiveness() {
    const questions = await ManualQuestion.find({ status: "published" })
      .populate("topicId", "name subjectId")
      .select("_id topicId difficulty correctAttempts totalAttempts");

    const histories = await UserQuestionHistory.find({})
      .select("questionId lapses reps state");

    const questionStats = {};
    histories.forEach((h) => {
      const qId = h.questionId?.toString();
      if (!qId) return;
      if (!questionStats[qId]) {
        questionStats[qId] = { correct: 0, total: 0, lapses: 0 };
      }
      questionStats[qId].total += h.reps || 1;
      questionStats[qId].lapses += h.lapses || 0;
      if (h.state === "review") questionStats[qId].correct++;
    });

    const topicStats = {};
    questions.forEach((q) => {
      const topicId = q.topicId?._id?.toString();
      if (!topicId) return;

      if (!topicStats[topicId]) {
        topicStats[topicId] = {
          topicId,
          name: q.topicId.name,
          subjectId: q.topicId.subjectId,
          totalQuestions: 0,
          totalAttempts: 0,
          correctAttempts: 0,
        };
      }

      topicStats[topicId].totalQuestions++;

      const stats = questionStats[q._id.toString()];
      if (stats) {
        topicStats[topicId].totalAttempts += stats.total;
        topicStats[topicId].correctAttempts += stats.correct;
      }
    });

    const topicEffectiveness = Object.values(topicStats)
      .map((t) => ({
        ...t,
        passRate: t.totalAttempts > 0 ? Math.round((t.correctAttempts / t.totalAttempts) * 100) : 0,
      }))
      .sort((a, b) => a.passRate - b.passRate);

    const difficultQuestions = questions
      .filter((q) => {
        const stats = questionStats[q._id.toString()];
        return stats && stats.total >= 5 && stats.lapses / stats.total > 0.5;
      })
      .slice(0, 20)
      .map((q) => ({
        questionId: q._id,
        topicName: q.topicId?.name,
        difficulty: q.difficulty,
        failureRate: Math.round(
          (questionStats[q._id.toString()].lapses / questionStats[q._id.toString()].total) * 100
        ),
      }));

    return {
      topicEffectiveness,
      difficultQuestions,
      totalQuestions: questions.length,
      totalTopics: Object.keys(topicStats).length,
    };
  },

  async getSubjectCompletionRates() {
    const subjects = await Subject.find({ isActive: true }).select("_id name");
    const histories = await UserQuestionHistory.find({})
      .populate({
        path: "topicId",
        select: "subjectId",
      });

    const subjectProgress = {};
    subjects.forEach((s) => {
      subjectProgress[s._id.toString()] = {
        subjectId: s._id,
        name: s.name,
        uniqueUsers: new Set(),
        totalReviews: 0,
        masteredCount: 0,
      };
    });

    const now = new Date();
    histories.forEach((h) => {
      const subjectId = h.topicId?.subjectId?.toString();
      if (!subjectId || !subjectProgress[subjectId]) return;

      subjectProgress[subjectId].uniqueUsers.add(h.userId.toString());
      subjectProgress[subjectId].totalReviews++;

      const retrievability = fsrsService.getRetrievability(h, now);
      if (retrievability > 0.9 && (h.stability || 0) > 21) {
        subjectProgress[subjectId].masteredCount++;
      }
    });

    return Object.values(subjectProgress).map((s) => ({
      subjectId: s.subjectId,
      name: s.name,
      uniqueUsers: s.uniqueUsers.size,
      totalReviews: s.totalReviews,
      masteredCount: s.masteredCount,
      masteryRate: s.totalReviews > 0 ? Math.round((s.masteredCount / s.totalReviews) * 100) : 0,
    }));
  },
};

export default fsrsAnalyticsService;
