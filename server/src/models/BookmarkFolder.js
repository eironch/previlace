import mongoose from "mongoose";

const bookmarkFolderSchema = new mongoose.Schema(
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
    color: {
      type: String,
      default: "#3B82F6",
    },
  },
  {
    timestamps: true,
  }
);

bookmarkFolderSchema.index({ userId: 1, name: 1 });

bookmarkFolderSchema.methods.getStats = async function () {
  const Bookmark = mongoose.model("Bookmark");
  const count = await Bookmark.countDocuments({ folderId: this._id });
  return { totalBookmarks: count };
};

bookmarkFolderSchema.statics.getUserFolders = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

export default mongoose.model("BookmarkFolder", bookmarkFolderSchema);
