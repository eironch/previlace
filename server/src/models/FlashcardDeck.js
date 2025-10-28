import mongoose from "mongoose";

const flashcardDeckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ManualQuestion",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    statistics: {
      totalCards: {
        type: Number,
        default: 0,
      },
      masteredCards: {
        type: Number,
        default: 0,
      },
      learningCards: {
        type: Number,
        default: 0,
      },
      reviewCards: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

flashcardDeckSchema.index({ userId: 1, name: 1 });
flashcardDeckSchema.index({ isPublic: 1 });
flashcardDeckSchema.index({ userId: 1, createdAt: -1 });
flashcardDeckSchema.index({ isPublic: 1, createdAt: -1 });

flashcardDeckSchema.methods.addQuestion = async function (questionId) {
  const questionObjectId = new mongoose.Types.ObjectId(questionId);
  if (!this.questionIds.some((id) => id.toString() === questionObjectId.toString())) {
    this.questionIds.push(questionObjectId);
    await this.save();
  }
  return this;
};

flashcardDeckSchema.methods.removeQuestion = async function (questionId) {
  this.questionIds = this.questionIds.filter((id) => id.toString() !== questionId.toString());
  await this.save();
  return this;
};

flashcardDeckSchema.methods.updateStatistics = async function () {
  try {
    const Flashcard = mongoose.model("Flashcard");
    const cards = await Flashcard.find({ deckId: this._id });

    this.statistics.totalCards = cards.length;
    this.statistics.masteredCards = cards.filter((c) => c.easeFactor >= 2.5).length;
    this.statistics.learningCards = cards.filter((c) => c.easeFactor >= 1.5 && c.easeFactor < 2.5).length;
    this.statistics.reviewCards = cards.filter((c) => c.easeFactor < 1.5).length;

    await this.save();
    return this;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("FlashcardDeck.updateStatistics error:", error);
    }
    throw error;
  }
};

flashcardDeckSchema.methods.shareWith = async function (userId) {
  if (!this.sharedWith.some((id) => id.toString() === userId.toString())) {
    this.sharedWith.push(userId);
    await this.save();
  }
  return this;
};

flashcardDeckSchema.methods.unshareWith = async function (userId) {
  this.sharedWith = this.sharedWith.filter((id) => id.toString() !== userId.toString());
  await this.save();
  return this;
};

flashcardDeckSchema.statics.getUserDecks = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

flashcardDeckSchema.statics.getPublicDecks = function (limit = 10) {
  return this.find({ isPublic: true }).limit(limit).sort({ createdAt: -1 });
};

flashcardDeckSchema.statics.getSharedDecks = function (userId) {
  return this.find({ sharedWith: userId }).sort({ createdAt: -1 });
};

flashcardDeckSchema.statics.getDeckWithCards = function (deckId) {
  return this.findById(deckId).populate({
    path: "questionIds",
    select: "question answer explanation category difficulty",
  });
};

const FlashcardDeck = mongoose.model("FlashcardDeck", flashcardDeckSchema);

export default FlashcardDeck;
