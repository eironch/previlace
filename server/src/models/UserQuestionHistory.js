import mongoose from "mongoose";
import fsrsService, { Rating_ENUM, State_ENUM } from "../services/fsrsService.js";

const userQuestionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManualQuestion",
      required: true,
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    attempts: [
      {
        sessionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "QuizAttempt",
        },
        isCorrect: Boolean,
        timeSpent: Number,
        answeredAt: {
          type: Date,
          default: Date.now,
        },
        userAnswer: String,
      },
    ],
    totalAttempts: {
      type: Number,
      default: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
    },
    incorrectAttempts: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number,
      default: 0,
    },
    masteryLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "mastered"],
      default: "beginner",
    },
    lastAttemptAt: Date,
    firstAttemptAt: {
      type: Date,
      default: Date.now,
    },
    mistakePatterns: [
      {
        type: String,
        enum: ["careless", "knowledge-gap", "time-pressure", "misread"],
      },
    ],
    weaknessScore: {
      type: Number,
      default: 0,
    },
    isWeakArea: {
      type: Boolean,
      default: false,
    },
    fsrsData: {
      stability: {
        type: Number,
        default: 0,
      },
      difficulty: {
        type: Number,
        default: 5,
        min: 1,
        max: 10,
      },
      due: {
        type: Date,
        default: Date.now,
        index: true,
      },
      elapsedDays: {
        type: Number,
        default: 0,
      },
      scheduledDays: {
        type: Number,
        default: 0,
      },
      reps: {
        type: Number,
        default: 0,
      },
      lapses: {
        type: Number,
        default: 0,
      },
      state: {
        type: String,
        enum: ["new", "learning", "review", "relearning"],
        default: "new",
      },
      lastReview: Date,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userQuestionHistorySchema.index({ userId: 1, questionId: 1 }, { unique: true });
userQuestionHistorySchema.index({ userId: 1, masteryLevel: 1 });
userQuestionHistorySchema.index({ userId: 1, lastAttemptAt: -1 });
userQuestionHistorySchema.index({ userId: 1, "fsrsData.due": 1 });
userQuestionHistorySchema.index({ "fsrsData.due": 1, "fsrsData.state": 1 });

userQuestionHistorySchema.methods.recordAttempt = function (sessionId, isCorrect, timeSpent, userAnswer) {
  this.attempts.push({
    sessionId,
    isCorrect,
    timeSpent,
    userAnswer,
  });

  this.totalAttempts++;
  if (isCorrect) {
    this.correctAttempts++;
  } else {
    this.incorrectAttempts++;
  }

  this.lastAttemptAt = new Date();

  const totalTime = this.attempts.reduce((sum, att) => sum + (att.timeSpent || 0), 0);
  this.averageResponseTime = totalTime / this.totalAttempts;

  this.updateMasteryLevel();

  return this.save();
};

userQuestionHistorySchema.methods.updateMasteryLevel = function () {
  const accuracy = this.correctAttempts / this.totalAttempts;

  if (this.totalAttempts < 3) {
    this.masteryLevel = "beginner";
  } else if (accuracy < 0.5) {
    this.masteryLevel = "beginner";
  } else if (accuracy < 0.75) {
    this.masteryLevel = "intermediate";
  } else if (accuracy < 0.95) {
    this.masteryLevel = "advanced";
  } else {
    this.masteryLevel = "mastered";
  }

  if (this.totalAttempts >= 3) {
    this.weaknessScore = (1 - accuracy) * 100;
    this.isWeakArea = this.weaknessScore > 50;
  }
};

userQuestionHistorySchema.methods.getAccuracy = function () {
  if (this.totalAttempts === 0) return 0;
  return (this.correctAttempts / this.totalAttempts) * 100;
};

userQuestionHistorySchema.methods.updateFSRS = function (isCorrect, responseTime) {
  const rating = this.calculateRating(isCorrect, responseTime);
  
  const card = {
    due: this.fsrsData.due || new Date(),
    stability: this.fsrsData.stability || 0,
    difficulty: this.fsrsData.difficulty || 5,
    elapsedDays: this.fsrsData.elapsedDays || 0,
    scheduledDays: this.fsrsData.scheduledDays || 0,
    reps: this.fsrsData.reps || 0,
    lapses: this.fsrsData.lapses || 0,
    state: fsrsService.stringToState(this.fsrsData.state || "new"),
    lastReview: this.fsrsData.lastReview || null
  };

  const updatedCard = fsrsService.schedule(card, new Date(), rating);

  this.fsrsData = {
    stability: updatedCard.stability,
    difficulty: updatedCard.difficulty,
    due: updatedCard.due,
    elapsedDays: updatedCard.elapsedDays,
    scheduledDays: updatedCard.scheduledDays,
    reps: updatedCard.reps,
    lapses: updatedCard.lapses,
    state: fsrsService.stateToString(updatedCard.state),
    lastReview: updatedCard.lastReview
  };

  return this;
};

userQuestionHistorySchema.methods.calculateRating = function (isCorrect, responseTime) {
  if (!isCorrect) {
    return Rating_ENUM.AGAIN;
  }

  const avgTime = this.averageResponseTime || 30000;
  const timeRatio = responseTime / avgTime;
  const recentAttempts = this.attempts.slice(-5);
  const recentCorrect = recentAttempts.filter(a => a.isCorrect).length;

  if (timeRatio <= 0.5 && recentCorrect >= 4) {
    return Rating_ENUM.EASY;
  }
  if (timeRatio <= 0.8) {
    return Rating_ENUM.GOOD;
  }
  return Rating_ENUM.HARD;
};

userQuestionHistorySchema.methods.getRetrievability = function () {
  if (this.fsrsData.state === "new" || !this.fsrsData.lastReview) {
    return 0;
  }

  const card = {
    stability: this.fsrsData.stability,
    state: fsrsService.stringToState(this.fsrsData.state),
    lastReview: this.fsrsData.lastReview
  };

  return fsrsService.getRetrievability(card);
};

userQuestionHistorySchema.methods.isDueForReview = function () {
  if (!this.fsrsData.due) return true;
  return new Date() >= new Date(this.fsrsData.due) && this.masteryLevel !== "mastered";
};

userQuestionHistorySchema.methods.getDaysUntilReview = function () {
  const now = new Date();
  const reviewDate = new Date(this.fsrsData.due);
  const diffTime = reviewDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

userQuestionHistorySchema.statics.getDueForReview = function (userId, limit = 50) {
  return this.find({
    userId,
    "fsrsData.due": { $lte: new Date() },
    masteryLevel: { $ne: "mastered" }
  })
    .sort({ "fsrsData.due": 1 })
    .limit(limit)
    .populate("questionId");
};

userQuestionHistorySchema.statics.getReviewSchedule = function (userId, days = 7) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        "fsrsData.due": {
          $gte: new Date(),
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$fsrsData.due"
          }
        },
        count: { $sum: 1 },
        questions: {
          $push: {
            questionId: "$questionId",
            masteryLevel: "$masteryLevel",
            nextReview: "$fsrsData.due"
          }
        }
      }
    },
    { $sort: { "_id": 1 } }
  ]);
};

userQuestionHistorySchema.methods.getRecentAttempts = function (limit = 5) {
  return this.attempts.slice(-limit);
};

userQuestionHistorySchema.statics.getOrCreate = async function (userId, questionId) {
  let history = await this.findOne({ userId, questionId });

  if (!history) {
    history = await this.create({
      userId,
      questionId,
      fsrsData: {
        stability: 0,
        difficulty: 5,
        due: new Date(),
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        state: "new",
        lastReview: null
      }
    });
  }

  return history;
};

userQuestionHistorySchema.statics.getUserWeakAreas = function (userId) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "manualquestions",
        localField: "questionId",
        foreignField: "_id",
        as: "question",
      },
    },
    {
      $unwind: "$question",
    },
    {
      $match: {
        $expr: { $lt: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 0.5] },
      },
    },
    {
      $group: {
        _id: "$question.category",
        count: { $sum: 1 },
        averageAccuracy: {
          $avg: { $divide: ["$correctAttempts", "$totalAttempts"] },
        },
      },
    },
    {
      $sort: { averageAccuracy: 1 },
    },
  ]);
};

userQuestionHistorySchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalQuestionsAttempted: { $sum: 1 },
        totalAttempts: { $sum: "$totalAttempts" },
        totalCorrect: { $sum: "$correctAttempts" },
        averageAccuracy: {
          $avg: { $divide: ["$correctAttempts", "$totalAttempts"] },
        },
        masteredCount: {
          $sum: { $cond: [{ $eq: ["$masteryLevel", "mastered"] }, 1, 0] },
        },
        advancedCount: {
          $sum: { $cond: [{ $eq: ["$masteryLevel", "advanced"] }, 1, 0] },
        },
        intermediateCount: {
          $sum: { $cond: [{ $eq: ["$masteryLevel", "intermediate"] }, 1, 0] },
        },
        beginnerCount: {
          $sum: { $cond: [{ $eq: ["$masteryLevel", "beginner"] }, 1, 0] },
        },
        averageStability: { $avg: "$fsrsData.stability" },
        totalLapses: { $sum: "$fsrsData.lapses" },
      },
    },
  ]);
};

userQuestionHistorySchema.statics.getExamReadiness = async function (userId, examDate) {
  const histories = await this.find({ userId });
  
  const cards = histories.map(h => ({
    stability: h.fsrsData?.stability || 0,
    state: fsrsService.stringToState(h.fsrsData?.state || "new"),
    lastReview: h.fsrsData?.lastReview || null
  }));

  return fsrsService.calculateExamReadiness(cards, examDate);
};

userQuestionHistorySchema.statics.getByRetrievability = async function (userId, threshold = 0.9, limit = 50) {
  const histories = await this.find({
    userId,
    "fsrsData.state": { $in: ["review", "relearning"] }
  }).populate("questionId");

  const now = new Date();
  const withRetrievability = histories.map(h => {
    const card = {
      stability: h.fsrsData.stability,
      state: fsrsService.stringToState(h.fsrsData.state),
      lastReview: h.fsrsData.lastReview
    };
    return {
      history: h,
      retrievability: fsrsService.getRetrievability(card, now)
    };
  });

  return withRetrievability
    .filter(item => item.retrievability < threshold)
    .sort((a, b) => a.retrievability - b.retrievability)
    .slice(0, limit)
    .map(item => item.history);
};

export default mongoose.model("UserQuestionHistory", userQuestionHistorySchema);
