import { getRolePermissions, hasPermission, hasAnyPermission, hasAllPermissions, canManageRole } from "../constants/rolePermissions.js";
import User from "../models/User.js";
import ReviewCenter from "../models/ReviewCenter.js";

class RoleService {
  getUserPermissions(user) {
    return getRolePermissions(user.role);
  }

  checkPermission(user, permission) {
    return hasPermission(user.role, permission);
  }

  checkAnyPermission(user, permissions) {
    return hasAnyPermission(user.role, permissions);
  }

  checkAllPermissions(user, permissions) {
    return hasAllPermissions(user.role, permissions);
  }

  async canAccessUser(requester, targetUserId) {
    if (requester.role === "super_admin") return true;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return false;

    if (requester.role === "admin") {
      return (
        targetUser.role === "student" &&
        targetUser.reviewCenterId?.toString() === requester.reviewCenterId?.toString()
      );
    }

    return requester._id.toString() === targetUserId.toString();
  }

  async canAccessReviewCenter(user, reviewCenterId) {
    if (user.role === "super_admin") return true;

    if (user.role === "admin") {
      return user.reviewCenterId?.toString() === reviewCenterId.toString();
    }

    return false;
  }

  async getAccessibleUsers(requester, filters = {}) {
    let query = { ...filters };

    if (requester.role === "admin") {
      query.reviewCenterId = requester.reviewCenterId;
      query.role = "student";
    } else if (requester.role === "student") {
      query._id = requester._id;
    }

    return User.find(query);
  }

  async getAccessibleReviewCenters(user) {
    if (user.role === "super_admin") {
      return ReviewCenter.getActiveReviewCenters();
    }

    if (user.role === "admin") {
      return ReviewCenter.find({ _id: user.reviewCenterId });
    }

    return [];
  }

  canTransitionRole(requesterRole, currentRole, targetRole) {
    if (requesterRole === "super_admin") {
      return true;
    }

    if (requesterRole === "admin") {
      return currentRole === "student" && targetRole === "student";
    }

    return false;
  }

  validateRoleChange(requester, targetUser, newRole) {
    if (requester.role === "super_admin") {
      return { valid: true };
    }

    if (requester.role === "admin") {
      if (targetUser.role !== "student" || newRole !== "student") {
        return {
          valid: false,
          message: "Admins can only manage student accounts",
        };
      }

      if (
        targetUser.reviewCenterId?.toString() !==
        requester.reviewCenterId?.toString()
      ) {
        return {
          valid: false,
          message: "Cannot manage users from other review centers",
        };
      }

      return { valid: true };
    }

    return {
      valid: false,
      message: "Insufficient permissions",
    };
  }
}

export default new RoleService();
