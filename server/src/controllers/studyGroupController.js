import StudyGroup from "../models/StudyGroup.js";
import StudyGroupMember from "../models/StudyGroupMember.js";
import StudyGroupMessage from "../models/StudyGroupMessage.js";
import StudyGroupSession from "../models/StudyGroupSession.js";
import { AppError, catchAsync } from "../utils/AppError.js";
import socketService from "../services/socketService.js";

const createStudyGroup = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    category = "general",
    isPrivate = false,
    memberLimit = 50,
    studyGoals = [],
    rules = [],
    settings = {},
  } = req.body;

  if (!name || name.trim().length === 0) {
    return next(new AppError("Group name is required", 400));
  }

  const groupData = {
    name: name.trim(),
    description: description?.trim(),
    createdBy: req.user._id,
    category,
    isPrivate,
    memberLimit,
    studyGoals,
    rules,
    settings: {
      allowMemberInvites: settings.allowMemberInvites ?? true,
      requireApproval: settings.requireApproval ?? false,
      allowFileSharing: settings.allowFileSharing ?? true,
      allowQuizSharing: settings.allowQuizSharing ?? true,
    },
  };

  const studyGroup = await StudyGroup.create(groupData);

  await StudyGroupMember.create({
    groupId: studyGroup._id,
    userId: req.user._id,
    role: "admin",
    status: "active",
    permissions: {
      canInviteMembers: true,
      canManageMessages: true,
      canScheduleSessions: true,
      canShareQuizzes: true,
    },
  });

  await StudyGroupMessage.createSystemMessage(studyGroup._id, "group_created");
  await studyGroup.updateMemberCount();

  res.status(201).json({
    success: true,
    data: { studyGroup },
  });
});

const getPublicGroups = catchAsync(async (req, res, next) => {
  const { search = "", category = "", page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const groups = await StudyGroup.findPublicGroups(
    search,
    category,
    parseInt(limit),
    skip
  );

  const totalGroups = await StudyGroup.countDocuments({
    isActive: true,
    isPrivate: false,
    ...(search && { $text: { $search: search } }),
    ...(category && category !== "all" && { category }),
  });

  res.json({
    success: true,
    data: {
      groups,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalGroups / parseInt(limit)),
        totalItems: totalGroups,
      },
    },
  });
});

const getUserGroups = catchAsync(async (req, res, next) => {
  const memberships = await StudyGroupMember.getUserGroups(req.user._id);

  res.json({
    success: true,
    data: { groups: memberships },
  });
});

const getGroupDetails = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;

  const group = await StudyGroup.findById(groupId)
    .populate("createdBy", "firstName lastName avatar")
    .populate({
      path: "stats",
      select: "totalMembers activeMembers",
    });

  if (!group || !group.isActive) {
    return next(new AppError("Study group not found", 404));
  }

  const membership = await StudyGroupMember.isMember(req.user._id, groupId);
  
  if (group.isPrivate && !membership) {
    return next(new AppError("Access denied to private group", 403));
  }

  const members = await StudyGroupMember.getGroupMembers(groupId);
  const upcomingSessions = await StudyGroupSession.getUpcomingSessions(groupId);

  res.json({
    success: true,
    data: {
      group,
      members,
      upcomingSessions,
      userMembership: membership,
    },
  });
});

const joinGroup = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { inviteCode } = req.body;

  const group = await StudyGroup.findById(groupId);

  if (!group || !group.isActive) {
    return next(new AppError("Study group not found", 404));
  }

  if (group.isPrivate && group.inviteCode !== inviteCode) {
    return next(new AppError("Invalid invite code", 400));
  }

  const existingMembership = await StudyGroupMember.isMember(req.user._id, groupId);

  if (existingMembership) {
    return next(new AppError("Already a member of this group", 400));
  }

  if (!group.canUserJoin(req.user._id)) {
    return next(new AppError("Cannot join group - member limit reached", 400));
  }

  const memberData = {
    groupId,
    userId: req.user._id,
    role: "member",
    status: group.settings.requireApproval ? "pending" : "active",
  };

  const membership = await StudyGroupMember.create(memberData);

  if (membership.status === "active") {
    await StudyGroupMessage.createSystemMessage(groupId, "member_joined", {
      userName: `${req.user.firstName} ${req.user.lastName}`,
    });

    await group.updateMemberCount();

    socketService.io.to(`group_${groupId}`).emit("group:member_joined", {
      groupId,
      member: {
        userId: req.user._id,
        user: req.user,
        role: "member",
        joinedAt: membership.joinedAt,
      },
    });
  }

  res.status(201).json({
    success: true,
    data: { membership },
  });
});

const joinGroupByInviteCode = catchAsync(async (req, res, next) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    return next(new AppError("Invite code is required", 400));
  }

  const group = await StudyGroup.findByInviteCode(inviteCode);

  if (!group) {
    return next(new AppError("Invalid invite code", 400));
  }

  req.params.groupId = group._id;
  req.body.inviteCode = inviteCode;

  return joinGroup(req, res, next);
});

const leaveGroup = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;

  const membership = await StudyGroupMember.findOne({
    groupId,
    userId: req.user._id,
    status: "active",
  });

  if (!membership) {
    return next(new AppError("Not a member of this group", 400));
  }

  if (membership.role === "admin") {
    const adminCount = await StudyGroupMember.countDocuments({
      groupId,
      role: "admin",
      status: "active",
    });

    if (adminCount === 1) {
      return next(new AppError("Cannot leave - you are the only admin", 400));
    }
  }

  membership.status = "inactive";
  await membership.save();

  const group = await StudyGroup.findById(groupId);
  await group.updateMemberCount();

  await StudyGroupMessage.createSystemMessage(groupId, "member_left", {
    userName: `${req.user.firstName} ${req.user.lastName}`,
  });

  socketService.io.to(`group_${groupId}`).emit("group:member_left", {
    groupId,
    userId: req.user._id,
  });

  res.json({
    success: true,
    data: { message: "Successfully left the group" },
  });
});

const updateGroup = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { name, description, studyGoals, rules, settings } = req.body;

  const membership = await StudyGroupMember.getMemberRole(req.user._id, groupId);

  if (!membership || membership.role !== "admin") {
    return next(new AppError("Only admins can update group settings", 403));
  }

  const updateData = {};
  if (name && name.trim()) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim();
  if (studyGoals) updateData.studyGoals = studyGoals;
  if (rules) updateData.rules = rules;
  if (settings) updateData.settings = { ...settings };

  const group = await StudyGroup.findByIdAndUpdate(groupId, updateData, {
    new: true,
    runValidators: true,
  });

  socketService.io.to(`group_${groupId}`).emit("group:updated", {
    groupId,
    updates: updateData,
  });

  res.json({
    success: true,
    data: { group },
  });
});

const manageMember = catchAsync(async (req, res, next) => {
  const { groupId, memberId } = req.params;
  const { action, role } = req.body;

  const adminMembership = await StudyGroupMember.getMemberRole(req.user._id, groupId);

  if (!adminMembership || !["admin", "moderator"].includes(adminMembership.role)) {
    return next(new AppError("Insufficient permissions", 403));
  }

  const targetMembership = await StudyGroupMember.findOne({
    groupId,
    userId: memberId,
    status: { $in: ["active", "pending"] },
  });

  if (!targetMembership) {
    return next(new AppError("Member not found", 404));
  }

  if (targetMembership.role === "admin" && adminMembership.role !== "admin") {
    return next(new AppError("Cannot manage admin members", 403));
  }

  let result;
  switch (action) {
    case "promote":
      if (role === "moderator") {
        result = await targetMembership.promoteToModerator();
      } else if (role === "admin" && adminMembership.role === "admin") {
        result = await targetMembership.promoteToAdmin();
      } else {
        return next(new AppError("Invalid promotion", 400));
      }
      break;

    case "demote":
      if (adminMembership.role === "admin") {
        result = await targetMembership.demoteToMember();
      } else {
        return next(new AppError("Only admins can demote members", 403));
      }
      break;

    case "ban":
      if (adminMembership.role === "admin") {
        result = await targetMembership.banMember();
      } else {
        return next(new AppError("Only admins can ban members", 403));
      }
      break;

    case "approve":
      if (targetMembership.status === "pending") {
        targetMembership.status = "active";
        result = await targetMembership.save();
      } else {
        return next(new AppError("Member is not pending approval", 400));
      }
      break;

    default:
      return next(new AppError("Invalid action", 400));
  }

  const group = await StudyGroup.findById(groupId);
  await group.updateMemberCount();

  const targetUser = await targetMembership.populate("userId", "firstName lastName");

  socketService.io.to(`group_${groupId}`).emit("group:member_updated", {
    groupId,
    memberId,
    action,
    role: result.role,
  });

  res.json({
    success: true,
    data: { membership: result },
  });
});

const sendMessage = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { content, messageType = "text", metadata = {}, replyTo } = req.body;

  if (!content || content.trim().length === 0) {
    return next(new AppError("Message content is required", 400));
  }

  const membership = await StudyGroupMember.findOne({
    groupId,
    userId: req.user._id,
    status: "active",
  });

  if (!membership) {
    return next(new AppError("Not a member of this group", 403));
  }

  const messageData = {
    groupId,
    senderId: req.user._id,
    content: content.trim(),
    messageType,
    metadata,
    replyTo: replyTo || undefined,
  };

  const message = await StudyGroupMessage.create(messageData);
  await message.populate("senderId", "firstName lastName avatar");

  if (replyTo) {
    await message.populate("replyTo", "content senderId");
    await message.populate({
      path: "replyTo",
      populate: {
        path: "senderId",
        select: "firstName lastName",
      },
    });
  }

  await membership.recordMessage();

  socketService.io.to(`group_${groupId}`).emit("group:new_message", {
    groupId,
    message,
  });

  res.status(201).json({
    success: true,
    data: { message },
  });
});

const getMessages = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { limit = 50, page = 1 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const membership = await StudyGroupMember.isMember(req.user._id, groupId);

  if (!membership) {
    return next(new AppError("Not a member of this group", 403));
  }

  const messages = await StudyGroupMessage.getGroupMessages(
    groupId,
    parseInt(limit),
    skip
  );

  const totalMessages = await StudyGroupMessage.countDocuments({
    groupId,
    isDeleted: false,
  });

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / parseInt(limit)),
        totalItems: totalMessages,
      },
    },
  });
});

const deleteMessage = catchAsync(async (req, res, next) => {
  const { groupId, messageId } = req.params;

  const membership = await StudyGroupMember.getMemberRole(req.user._id, groupId);

  if (!membership) {
    return next(new AppError("Not a member of this group", 403));
  }

  const message = await StudyGroupMessage.findById(messageId);

  if (!message || message.groupId.toString() !== groupId) {
    return next(new AppError("Message not found", 404));
  }

  const canDelete =
    message.senderId.toString() === req.user._id.toString() ||
    membership.permissions.canManageMessages;

  if (!canDelete) {
    return next(new AppError("Cannot delete this message", 403));
  }

  await message.deleteMessage(req.user._id);

  socketService.io.to(`group_${groupId}`).emit("group:message_deleted", {
    groupId,
    messageId,
  });

  res.json({
    success: true,
    data: { message: "Message deleted successfully" },
  });
});

const getGroupLeaderboard = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;

  const membership = await StudyGroupMember.isMember(req.user._id, groupId);

  if (!membership) {
    return next(new AppError("Not a member of this group", 403));
  }

  const group = await StudyGroup.findById(groupId);
  const leaderboard = await group.generateLeaderboard();

  res.json({
    success: true,
    data: { leaderboard },
  });
});

export default {
  createStudyGroup,
  getPublicGroups,
  getUserGroups,
  getGroupDetails,
  joinGroup,
  joinGroupByInviteCode,
  leaveGroup,
  updateGroup,
  manageMember,
  sendMessage,
  getMessages,
  deleteMessage,
  getGroupLeaderboard,
};
