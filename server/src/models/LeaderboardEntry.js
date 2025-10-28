import mongoose from "mongoose";

const leaderboardEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["overall", "weekly", "monthly", "daily", "category-specific"],
      required: true,
      index: true,
    },
    categoryName: String,
    points: {
      type: Number,
      default: 0,
      index: true,
    },
    rank: {
      type: Number,
      default: 0,
      index: true,
    },
    percentileRank: Number,
    sessionsCompleted: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    period: {
      year: Number,
      month: Number,
      week: Number,
      date: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

leaderboardEntrySchema.index({ category: 1, points: -1 });
leaderboardEntrySchema.index({ category: 1, rank: 1 });
leaderboardEntrySchema.index({ userId: 1, category: 1 }, { unique: true });
leaderboardEntrySchema.index({ "period.date": -1, category: 1 });

leaderboardEntrySchema.methods.updateEntry = function (stats) {
  this.points = stats.points || 0;
  this.sessionsCompleted = stats.sessionsCompleted || 0;
  this.averageScore = stats.averageScore || 0;
  this.totalTimeSpent = stats.totalTimeSpent || 0;
  this.streakCount = stats.streakCount || 0;
  this.lastUpdated = new Date();
  return this.save();
};

leaderboardEntrySchema.statics.getOrCreate = async function (userId, category, categoryName = null) {
  let entry = await this.findOne({ userId, category });

  if (!entry) {
    entry = await this.create({
      userId,
      category,
      categoryName,
      period: {
        date: new Date(),
      },
    });
  }

  return entry;
};

leaderboardEntrySchema.statics.getLeaderboard = function (category, limit = 100) {
  return this.find({ category })
    .populate("userId", "firstName lastName avatar")
    .sort({ points: -1 })
    .limit(limit)
    .exec();
};

leaderboardEntrySchema.statics.getUserRank = function (userId, category) {
  return this.countDocuments({
    category,
    points: { $gt: 0 },
  }).then((totalUsers) => {
    return this.findOne({ userId, category }).then((entry) => {
      if (!entry) return null;
      return {
        rank: entry.rank,
        percentile: Math.round((1 - entry.rank / totalUsers) * 100),
        points: entry.points,
        totalUsers,
      };
    });
  });
};

leaderboardEntrySchema.statics.getTopUsers = function (category, limit = 10) {
  return this.find({ category })
    .populate("userId", "firstName lastName avatar")
    .sort({ points: -1 })
    .limit(limit);
};

leaderboardEntrySchema.statics.getNearbyUsers = async function (userId, category, range = 5) {
  const userEntry = await this.findOne({ userId, category });

  if (!userEntry) return [];

  const startRank = Math.max(1, userEntry.rank - range);
  const endRank = userEntry.rank + range;

  return this.find({
    category,
    rank: { $gte: startRank, $lte: endRank },
  })
    .populate("userId", "firstName lastName avatar")
    .sort({ rank: 1 });
};

leaderboardEntrySchema.statics.updateRanks = async function (category) {
  const entries = await this.find({ category }).sort({ points: -1 });

  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
    entries[i].percentileRank = Math.round((1 - (i + 1) / entries.length) * 100);
    await entries[i].save();
  }

  return entries.length;
};

export default mongoose.model("LeaderboardEntry", leaderboardEntrySchema);
