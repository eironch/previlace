import SystemAudit from "../models/SystemAudit.js";

class AuditService {
  async log(auditData) {
    const { userId, userRole, action, resourceType, resourceId, details, changes, ipAddress, userAgent, status, errorMessage } = auditData;

    try {
      return await SystemAudit.logAction({
        userId,
        userRole,
        action,
        resourceType,
        resourceId,
        details,
        changes,
        ipAddress,
        userAgent,
        status: status || "success",
        errorMessage,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Audit service error:", error);
      }
    }
  }

  async logUserAction(user, action, details, req) {
    return this.log({
      userId: user._id,
      userRole: user.role,
      action,
      resourceType: "user",
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.["user-agent"],
    });
  }

  async logRoleChange(admin, targetUser, oldRole, newRole, req) {
    return this.log({
      userId: admin._id,
      userRole: admin.role,
      action: "role_changed",
      resourceType: "role",
      resourceId: targetUser._id,
      details: {
        targetUserEmail: targetUser.email,
        targetUserName: `${targetUser.firstName} ${targetUser.lastName}`,
      },
      changes: {
        before: { role: oldRole },
        after: { role: newRole },
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.["user-agent"],
    });
  }

  async logReviewCenterAction(admin, action, reviewCenter, req) {
    return this.log({
      userId: admin._id,
      userRole: admin.role,
      action,
      resourceType: "review_center",
      resourceId: reviewCenter._id,
      details: {
        reviewCenterName: reviewCenter.name,
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.["user-agent"],
    });
  }

  async logBulkOperation(admin, action, details, req) {
    return this.log({
      userId: admin._id,
      userRole: admin.role,
      action: "bulk_operation",
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.["user-agent"],
    });
  }

  async getUserAuditLog(userId, options) {
    return SystemAudit.getUserAuditLog(userId, options);
  }

  async getActionsByType(action, options) {
    return SystemAudit.getActionsByType(action, options);
  }

  async getRecentActivity(options) {
    return SystemAudit.getRecentActivity(options);
  }

  async getSystemStats(startDate, endDate) {
    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const stats = await SystemAudit.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return stats;
  }
}

export default new AuditService();
