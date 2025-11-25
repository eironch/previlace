import mongoose from "mongoose";

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
          ref: "QuizSession",
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
      default: 0, // 0-100, higher means weaker
    },
    isWeakArea: {
      type: Boolean,
      default: false,
    },
    spacedRepetitionData: {
      easeFactor: {
        type: Number,
        default: 2.5,
      },
      interval: {
        type: Number,
        default: 1,
      },
      repetitions: {
        type: Number,
        default: 0,
      },
      nextReviewDate: {
        type: Date,
        default: Date.now,
        index: true,
      },
      lastReviewedAt: Date,
      difficultyRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
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
userQuestionHistorySchema.index({ userId: 1, "spacedRepetitionData.nextReviewDate": 1 });
userQuestionHistorySchema.index({ "spacedRepetitionData.nextReviewDate": 1, masteryLevel: 1 });

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

  // Calculate weakness score (inverse of accuracy, weighted by attempts)
  // If accuracy is low and attempts are high, weakness is high.
  if (this.totalAttempts >= 3) {
      this.weaknessScore = (1 - accuracy) * 100;
      this.isWeakArea = this.weaknessScore > 50;
  }
};

userQuestionHistorySchema.methods.getAccuracy = function () {
  if (this.totalAttempts === 0) return 0;
  return (this.correctAttempts / this.totalAttempts) * 100;
};

userQuestionHistorySchema.methods.updateSpacedRepetition = function (isCorrect, responseTime, difficulty = "intermediate") {
  let easeFactor = this.spacedRepetitionData.easeFactor || 2.5;
  let interval = 1;
  
  if (isCorrect) {
    if (responseTime < 10000) {
      easeFactor = Math.min(easeFactor + 0.1, 3.0);
    }
    
    switch (difficulty) {
      case "beginner":
        interval = Math.ceil(easeFactor * 1);
        break;
      case "intermediate":
        interval = Math.ceil(easeFactor * 2);
        break;
      case "advanced":
        interval = Math.ceil(easeFactor * 3);
        break;
      default:
        interval = Math.ceil(easeFactor * 2);
    }
    
    this.spacedRepetitionData.repetitions++;
  } else {
    easeFactor = Math.max(easeFactor - 0.2, 1.3);
    interval = 1;
    this.spacedRepetitionData.repetitions = 0;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  this.spacedRepetitionData.easeFactor = easeFactor;
  this.spacedRepetitionData.interval = interval;
  this.spacedRepetitionData.nextReviewDate = nextReviewDate;
  this.spacedRepetitionData.lastReviewedAt = new Date();
};

userQuestionHistorySchema.methods.isDueForReview = function () {
  return new Date() >= this.spacedRepetitionData.nextReviewDate && this.masteryLevel !== "mastered";
};

userQuestionHistorySchema.methods.getDaysUntilReview = function () {
  const now = new Date();
  const reviewDate = new Date(this.spacedRepetitionData.nextReviewDate);
  const diffTime = reviewDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

userQuestionHistorySchema.statics.getDueForReview = function (userId, limit = 50) {
  return this.find({
    userId,
    "spacedRepetitionData.nextReviewDate": { $lte: new Date() },
    masteryLevel: { $ne: "mastered" }
  })
  .sort({ "spacedRepetitionData.nextReviewDate": 1 })
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
        "spacedRepetitionData.nextReviewDate": {
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
            date: "$spacedRepetitionData.nextReviewDate"
          }
        },
        count: { $sum: 1 },
        questions: {
          $push: {
            questionId: "$questionId",
            masteryLevel: "$masteryLevel",
            nextReview: "$spacedRepetitionData.nextReviewDate"
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
      spacedRepetitionData: {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReviewDate: new Date(),
        difficultyRating: 3
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
      },
    },
  ]);
};

export default mongoose.model("UserQuestionHistory", userQuestionHistorySchema);
