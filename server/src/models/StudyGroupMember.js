import mongoose from "mongoose";

const studyGroupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "moderator", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["active", "pending", "inactive", "banned"],
      default: "active",
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    permissions: {
      canInviteMembers: {
        type: Boolean,
        default: false,
      },
      canManageMessages: {
        type: Boolean,
        default: false,
      },
      canScheduleSessions: {
        type: Boolean,
        default: false,
      },
      canShareQuizzes: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      totalPoints: {
        type: Number,
        default: 0,
      },
      messagesCount: {
        type: Number,
        default: 0,
      },
      sessionsAttended: {
        type: Number,
        default: 0,
      },
      quizzesShared: {
        type: Number,
        default: 0,
      },
      helpfulVotes: {
        type: Number,
        default: 0,
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

studyGroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
studyGroupMemberSchema.index({ groupId: 1, role: 1 });
studyGroupMemberSchema.index({ userId: 1, status: 1 });
studyGroupMemberSchema.index({ groupId: 1, status: 1, lastActive: -1 });

studyGroupMemberSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save();
};

studyGroupMemberSchema.methods.addPoints = function (points) {
  this.stats.totalPoints += points;
  return this.save();
};

studyGroupMemberSchema.methods.promoteToModerator = function () {
  if (this.role === "member") {
    this.role = "moderator";
    this.permissions.canInviteMembers = true;
    this.permissions.canManageMessages = true;
    this.permissions.canScheduleSessions = true;
    return this.save();
  }
  throw new Error("Cannot promote this member");
};

studyGroupMemberSchema.methods.promoteToAdmin = function () {
  this.role = "admin";
  this.permissions = {
    canInviteMembers: true,
    canManageMessages: true,
    canScheduleSessions: true,
    canShareQuizzes: true,
  };
  return this.save();
};

studyGroupMemberSchema.methods.demoteToMember = function () {
  if (this.role !== "admin") {
    this.role = "member";
    this.permissions = {
      canInviteMembers: false,
      canManageMessages: false,
      canScheduleSessions: false,
      canShareQuizzes: true,
    };
    return this.save();
  }
  throw new Error("Cannot demote admin");
};

studyGroupMemberSchema.methods.banMember = function () {
  if (this.role !== "admin") {
    this.status = "banned";
    return this.save();
  }
  throw new Error("Cannot ban admin");
};

studyGroupMemberSchema.statics.getGroupMembers = function (groupId, status = "active") {
  return this.find({ groupId, status })
    .populate("userId", "firstName lastName avatar email")
    .populate("invitedBy", "firstName lastName")
    .sort({ role: 1, joinedAt: 1 });
};

studyGroupMemberSchema.statics.getUserGroups = function (userId, status = "active") {
  return this.find({ userId, status })
    .populate({
      path: "groupId",
      populate: {
        path: "createdBy",
        select: "firstName lastName avatar",
      },
    })
    .sort({ lastActive: -1 });
};

studyGroupMemberSchema.statics.isMember = function (userId, groupId) {
  return this.findOne({
    userId,
    groupId,
    status: { $in: ["active", "pending"] },
  });
};

studyGroupMemberSchema.statics.getGroupAdmins = function (groupId) {
  return this.find({ groupId, role: "admin", status: "active" })
    .populate("userId", "firstName lastName avatar email");
};

studyGroupMemberSchema.statics.getMemberRole = function (userId, groupId) {
  return this.findOne({ userId, groupId, status: "active" });
};

studyGroupMemberSchema.statics.getTopMembers = function (groupId, limit = 10) {
  return this.find({ groupId, status: "active" })
    .populate("userId", "firstName lastName avatar")
    .sort({ "stats.totalPoints": -1 })
    .limit(limit);
};

studyGroupMemberSchema.methods.recordSessionAttendance = function () {
  this.stats.sessionsAttended += 1;
  this.stats.totalPoints += 10;
  this.lastActive = new Date();
  return this.save();
};

studyGroupMemberSchema.methods.recordQuizShare = function () {
  this.stats.quizzesShared += 1;
  this.stats.totalPoints += 5;
  this.lastActive = new Date();
  return this.save();
};

studyGroupMemberSchema.methods.recordMessage = function () {
  this.stats.messagesCount += 1;
  this.stats.totalPoints += 1;
  this.lastActive = new Date();
  return this.save();
};

export default mongoose.model("StudyGroupMember", studyGroupMemberSchema);
