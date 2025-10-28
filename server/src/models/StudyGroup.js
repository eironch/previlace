import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    memberLimit: {
      type: Number,
      default: 50,
      min: 2,
      max: 100,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      enum: ["general", "professional", "sub-professional", "mixed"],
      default: "general",
    },
    studyGoals: [String],
    rules: [String],
    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      allowFileSharing: {
        type: Boolean,
        default: true,
      },
      allowQuizSharing: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      activeMembers: {
        type: Number,
        default: 0,
      },
      totalSessions: {
        type: Number,
        default: 0,
      },
      avgSessionAttendance: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

studyGroupSchema.index({ name: "text", description: "text" });
studyGroupSchema.index({ category: 1, isActive: 1 });
studyGroupSchema.index({ createdBy: 1, isActive: 1 });
studyGroupSchema.index({ isPrivate: 1, isActive: 1 });

studyGroupSchema.pre("save", function (next) {
  if (this.isNew && this.isPrivate && !this.inviteCode) {
    this.inviteCode = this.generateInviteCode();
  }
  next();
});

studyGroupSchema.methods.generateInviteCode = function () {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

studyGroupSchema.methods.updateMemberCount = async function () {
  const StudyGroupMember = mongoose.model("StudyGroupMember");
  const totalMembers = await StudyGroupMember.countDocuments({
    groupId: this._id,
    status: "active",
  });
  
  const activeMembers = await StudyGroupMember.countDocuments({
    groupId: this._id,
    status: "active",
    lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  this.stats.totalMembers = totalMembers;
  this.stats.activeMembers = activeMembers;
  
  return this.save();
};

studyGroupSchema.methods.canUserJoin = function (userId) {
  return this.stats.totalMembers < this.memberLimit && this.isActive;
};

studyGroupSchema.methods.generateLeaderboard = async function () {
  const StudyGroupMember = mongoose.model("StudyGroupMember");
  const QuizSession = mongoose.model("QuizSession");
  
  const members = await StudyGroupMember.find({
    groupId: this._id,
    status: "active",
  }).populate("userId", "firstName lastName avatar");

  const leaderboard = [];

  for (const member of members) {
    const quizSessions = await QuizSession.find({
      userId: member.userId._id,
      status: "completed",
      createdAt: { $gte: member.joinedAt },
    });

    const totalQuizzes = quizSessions.length;
    const avgScore = totalQuizzes > 0 
      ? quizSessions.reduce((sum, session) => sum + session.score.percentage, 0) / totalQuizzes
      : 0;

    leaderboard.push({
      userId: member.userId._id,
      user: member.userId,
      totalQuizzes,
      avgScore: Math.round(avgScore * 100) / 100,
      points: member.stats.totalPoints,
      role: member.role,
    });
  }

  return leaderboard.sort((a, b) => b.points - a.points);
};

studyGroupSchema.statics.findPublicGroups = function (search = "", category = "", limit = 20, skip = 0) {
  const query = { isActive: true, isPrivate: false };
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (category && category !== "all") {
    query.category = category;
  }

  return this.find(query)
    .populate("createdBy", "firstName lastName avatar")
    .sort({ "stats.totalMembers": -1, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

studyGroupSchema.statics.findByInviteCode = function (inviteCode) {
  return this.findOne({ inviteCode, isActive: true });
};

export default mongoose.model("StudyGroup", studyGroupSchema);
