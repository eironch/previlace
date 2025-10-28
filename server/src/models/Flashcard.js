import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
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
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlashcardDeck",
    },
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
    nextReviewDate: Date,
    lastReviewedAt: Date,
    reviewHistory: [
      {
        reviewedAt: {
          type: Date,
          default: Date.now,
        },
        quality: {
          type: Number,
          min: 0,
          max: 5,
        },
        timeSpent: Number,
      },
    ],
    totalReviews: {
      type: Number,
      default: 0,
    },
    correctReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

flashcardSchema.index({ userId: 1, questionId: 1 }, { unique: true });
flashcardSchema.index({ userId: 1, nextReviewDate: 1 });
flashcardSchema.index({ userId: 1, deckId: 1 });

flashcardSchema.methods.recordReview = function (quality, timeSpent) {
  this.reviewHistory.push({
    quality,
    timeSpent,
  });

  this.totalReviews++;
  if (quality >= 3) {
    this.correctReviews++;
  }

  this.lastReviewedAt = new Date();

  return this.save();
};

flashcardSchema.methods.getAccuracy = function () {
  if (this.totalReviews === 0) return 0;
  return (this.correctReviews / this.totalReviews) * 100;
};

flashcardSchema.methods.isDueForReview = function () {
  if (!this.nextReviewDate) return true;
  return new Date(this.nextReviewDate) <= new Date();
};

flashcardSchema.statics.getOrCreate = async function (userId, questionId, deckId) {
  let flashcard = await this.findOne({ userId, questionId });

  if (!flashcard) {
    flashcard = await this.create({
      userId,
      questionId,
      deckId,
    });
  }

  return flashcard;
};

flashcardSchema.statics.getDueCards = function (userId, limit = 20) {
  const now = new Date();
  return this.find({
    userId,
    $or: [
      { nextReviewDate: { $lte: now } },
      { nextReviewDate: null },
    ],
  })
    .populate("questionId")
    .limit(limit)
    .sort({ nextReviewDate: 1 });
};

flashcardSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: null,
        totalCards: { $sum: 1 },
        masteredCards: {
          $sum: { $cond: [{ $gte: ["$easeFactor", 2.5] }, 1, 0] },
        },
        dueCards: {
          $sum: {
            $cond: [
              { $lte: ["$nextReviewDate", new Date()] },
              1,
              0,
            ],
          },
        },
        averageEase: { $avg: "$easeFactor" },
        totalReviews: { $sum: "$totalReviews" },
      },
    },
  ]);
};

export default mongoose.model("Flashcard", flashcardSchema);
