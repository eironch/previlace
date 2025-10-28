import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookmarkFolder",
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: [String],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, folderId: 1 });
bookmarkSchema.index({ userId: 1, priority: 1 });

bookmarkSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    questionId: this.questionId,
    notes: this.notes,
    tags: this.tags,
    priority: this.priority,
    createdAt: this.createdAt,
  };
};

bookmarkSchema.statics.getUserBookmarks = function (userId, filters = {}) {
  const query = { userId };

  if (filters.folderId) {
    query.folderId = filters.folderId;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  return this.find(query)
    .populate("questionId", "questionText category difficulty")
    .sort({ createdAt: -1 });
};

bookmarkSchema.statics.getOrCreate = async function (userId, questionId, folderId) {
  let bookmark = await this.findOne({ userId, questionId });

  if (!bookmark) {
    bookmark = await this.create({ userId, questionId, folderId });
  }

  return bookmark;
};

bookmarkSchema.statics.removeBookmark = async function (userId, questionId) {
  return this.deleteOne({ userId, questionId });
};

bookmarkSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: null,
        totalBookmarks: { $sum: 1 },
        byPriority: {
          $push: {
            priority: "$priority",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalBookmarks: 1,
        highPriority: {
          $size: {
            $filter: {
              input: "$byPriority",
              as: "item",
              cond: { $eq: ["$$item.priority", "high"] },
            },
          },
        },
        mediumPriority: {
          $size: {
            $filter: {
              input: "$byPriority",
              as: "item",
              cond: { $eq: ["$$item.priority", "medium"] },
            },
          },
        },
        lowPriority: {
          $size: {
            $filter: {
              input: "$byPriority",
              as: "item",
              cond: { $eq: ["$$item.priority", "low"] },
            },
          },
        },
      },
    },
  ]);
};

export default mongoose.model("Bookmark", bookmarkSchema);
