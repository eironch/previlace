import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    challengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["quiz", "category", "speedrun", "accuracy", "mock_exam"],
      default: "quiz",
    },
    category: String,
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    questionCount: {
      type: Number,
      default: 10,
    },
    timeLimit: {
      type: Number,
      default: 600,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in-progress", "completed", "declined", "expired"],
      default: "pending",
      index: true,
    },
    challengerScore: {
      sessionId: mongoose.Schema.Types.ObjectId,
      score: Number,
      percentage: Number,
      timeSpent: Number,
      completedAt: Date,
    },
    opponentScore: {
      sessionId: mongoose.Schema.Types.ObjectId,
      score: Number,
      percentage: Number,
      timeSpent: Number,
      completedAt: Date,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

challengeSchema.index({ challengerId: 1, status: 1 });
challengeSchema.index({ opponentId: 1, status: 1 });
challengeSchema.index({ status: 1, expiresAt: 1 });

challengeSchema.methods.accept = function () {
  if (this.status !== "pending") {
    throw new Error("Challenge is not pending");
  }
  this.status = "accepted";
  return this.save();
};

challengeSchema.methods.decline = function () {
  if (this.status !== "pending") {
    throw new Error("Challenge is not pending");
  }
  this.status = "declined";
  return this.save();
};

challengeSchema.methods.recordChallengerScore = function (sessionId, score, percentage, timeSpent) {
  this.challengerScore = {
    sessionId,
    score,
    percentage,
    timeSpent,
    completedAt: new Date(),
  };

  if (this.opponentScore && this.opponentScore.completedAt) {
    this.determineWinner();
  }

  return this.save();
};

challengeSchema.methods.recordOpponentScore = function (sessionId, score, percentage, timeSpent) {
  this.opponentScore = {
    sessionId,
    score,
    percentage,
    timeSpent,
    completedAt: new Date(),
  };

  if (this.challengerScore && this.challengerScore.completedAt) {
    this.determineWinner();
  }

  return this.save();
};

challengeSchema.methods.determineWinner = function () {
  if (!this.challengerScore || !this.opponentScore) return;

  let winnerId;

  if (this.type === "speedrun") {
    winnerId =
      this.challengerScore.timeSpent <= this.opponentScore.timeSpent
        ? this.challengerId
        : this.opponentId;
  } else if (this.type === "accuracy") {
    winnerId =
      this.challengerScore.percentage >= this.opponentScore.percentage
        ? this.challengerId
        : this.opponentId;
  } else {
    winnerId =
      this.challengerScore.percentage >= this.opponentScore.percentage
        ? this.challengerId
        : this.opponentId;
  }

  this.winner = winnerId;
  this.status = "completed";
  this.completedAt = new Date();
};

challengeSchema.statics.getPendingChallenges = function (userId) {
  return this.find({
    opponentId: userId,
    status: "pending",
    expiresAt: { $gt: new Date() },
  })
    .populate("challengerId", "firstName lastName avatar")
    .sort({ createdAt: -1 });
};

challengeSchema.statics.getActiveChallenges = function (userId) {
  return this.find({
    $or: [{ challengerId: userId }, { opponentId: userId }],
    status: "in-progress",
  })
    .populate("challengerId", "firstName lastName avatar")
    .populate("opponentId", "firstName lastName avatar")
    .sort({ createdAt: -1 });
};

challengeSchema.statics.getChallengeHistory = function (userId, limit = 20) {
  return this.find({
    $or: [{ challengerId: userId }, { opponentId: userId }],
    status: "completed",
  })
    .populate("challengerId", "firstName lastName avatar")
    .populate("opponentId", "firstName lastName avatar")
    .populate("winner", "firstName lastName avatar")
    .sort({ completedAt: -1 })
    .limit(limit);
};

challengeSchema.statics.getUserChallengeStats = function (userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { challengerId: new mongoose.Types.ObjectId(userId) },
          { opponentId: new mongoose.Types.ObjectId(userId) },
        ],
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalChallenges: { $sum: 1 },
        wins: {
          $sum: {
            $cond: [{ $eq: ["$winner", new mongoose.Types.ObjectId(userId)] }, 1, 0],
          },
        },
        losses: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$winner", new mongoose.Types.ObjectId(userId)] },
                  { $ne: ["$winner", null] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);
};

export default mongoose.model("Challenge", challengeSchema);
