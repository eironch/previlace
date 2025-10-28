import mongoose from "mongoose";

const studyGroupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ["text", "quiz_share", "file", "system", "announcement"],
      default: "text",
    },
    metadata: {
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizSession",
      },
      fileName: String,
      fileUrl: String,
      fileSize: Number,
      systemAction: String,
    },
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    reactions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emoji: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroupMessage",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinnedAt: Date,
  },
  {
    timestamps: true,
  }
);

studyGroupMessageSchema.index({ groupId: 1, createdAt: -1 });
studyGroupMessageSchema.index({ senderId: 1, createdAt: -1 });
studyGroupMessageSchema.index({ groupId: 1, isPinned: 1 });
studyGroupMessageSchema.index({ groupId: 1, messageType: 1 });

studyGroupMessageSchema.methods.addReaction = function (userId, emoji) {
  const existingReaction = this.reactions.find(
    r => r.userId.toString() === userId.toString() && r.emoji === emoji
  );

  if (existingReaction) {
    throw new Error("Reaction already exists");
  }

  this.reactions.push({ userId, emoji });
  return this.save();
};

studyGroupMessageSchema.methods.removeReaction = function (userId, emoji) {
  this.reactions = this.reactions.filter(
    r => !(r.userId.toString() === userId.toString() && r.emoji === emoji)
  );
  return this.save();
};

studyGroupMessageSchema.methods.editMessage = function (newContent) {
  if (this.isDeleted) {
    throw new Error("Cannot edit deleted message");
  }

  this.editHistory.push({ content: this.content });
  this.content = newContent;
  this.isEdited = true;
  return this.save();
};

studyGroupMessageSchema.methods.deleteMessage = function (deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

studyGroupMessageSchema.methods.pinMessage = function (pinnedBy) {
  this.isPinned = true;
  this.pinnedBy = pinnedBy;
  this.pinnedAt = new Date();
  return this.save();
};

studyGroupMessageSchema.methods.unpinMessage = function () {
  this.isPinned = false;
  this.pinnedBy = undefined;
  this.pinnedAt = undefined;
  return this.save();
};

studyGroupMessageSchema.statics.getGroupMessages = function (groupId, limit = 50, skip = 0) {
  return this.find({ groupId, isDeleted: false })
    .populate("senderId", "firstName lastName avatar")
    .populate("replyTo", "content senderId")
    .populate({
      path: "replyTo",
      populate: {
        path: "senderId",
        select: "firstName lastName",
      },
    })
    .populate("reactions.userId", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

studyGroupMessageSchema.statics.getPinnedMessages = function (groupId) {
  return this.find({ groupId, isPinned: true, isDeleted: false })
    .populate("senderId", "firstName lastName avatar")
    .populate("pinnedBy", "firstName lastName")
    .sort({ pinnedAt: -1 });
};

studyGroupMessageSchema.statics.searchMessages = function (groupId, searchTerm, limit = 20) {
  return this.find({
    groupId,
    isDeleted: false,
    content: { $regex: searchTerm, $options: "i" },
  })
    .populate("senderId", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .limit(limit);
};

studyGroupMessageSchema.statics.createSystemMessage = function (groupId, action, metadata = {}) {
  return this.create({
    groupId,
    senderId: null,
    content: this.generateSystemMessage(action, metadata),
    messageType: "system",
    metadata: { systemAction: action, ...metadata },
  });
};

studyGroupMessageSchema.statics.generateSystemMessage = function (action, metadata) {
  const messages = {
    member_joined: `${metadata.userName} joined the group`,
    member_left: `${metadata.userName} left the group`,
    member_promoted: `${metadata.userName} was promoted to ${metadata.role}`,
    member_banned: `${metadata.userName} was banned from the group`,
    session_scheduled: `Study session scheduled for ${metadata.sessionDate}`,
    session_started: `Study session "${metadata.sessionName}" has started`,
    session_ended: `Study session "${metadata.sessionName}" has ended`,
    quiz_shared: `${metadata.userName} shared a quiz: ${metadata.quizName}`,
    group_created: `Study group was created`,
  };

  return messages[action] || `Group activity: ${action}`;
};

studyGroupMessageSchema.statics.getMessagesByType = function (groupId, messageType, limit = 20) {
  return this.find({ groupId, messageType, isDeleted: false })
    .populate("senderId", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .limit(limit);
};

studyGroupMessageSchema.statics.getUserMessageCount = function (userId, groupId) {
  return this.countDocuments({
    senderId: userId,
    groupId,
    isDeleted: false,
  });
};

export default mongoose.model("StudyGroupMessage", studyGroupMessageSchema);
