import roleService from "../services/roleService.js";
import { PERMISSIONS } from "../constants/permissions.js";

export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const hasPermission = roleService.checkAnyPermission(req.user, permissions);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        required: permissions,
      });
    }

    next();
  };
}

export function requireAllPermissions(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const hasAllPermissions = roleService.checkAllPermissions(
      req.user,
      permissions
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        required: permissions,
      });
    }

    next();
  };
}

export function requireResourceAccess(resourceType) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    try {
      const resourceId =
        req.params.id || req.params.userId || req.params.centerId;

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID required",
        });
      }

      let canAccess = false;

      switch (resourceType) {
        case "user":
          canAccess = await roleService.canAccessUser(req.user, resourceId);
          break;
        case "reviewCenter":
          canAccess = await roleService.canAccessReviewCenter(
            req.user,
            resourceId
          );
          break;
        default:
          canAccess = false;
      }

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this resource",
        });
      }

      next();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Resource access check error:", error);
      }
      return res.status(500).json({
        success: false,
        message: "Error checking resource access",
      });
    }
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient role privileges",
        required: roles,
      });
    }

    next();
  };
}

export function requireSameReviewCenter() {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role === "super_admin") {
      return next();
    }

    if (req.user.role === "admin") {
      const targetId = req.params.id || req.params.userId;

      if (!targetId) {
        return next();
      }

      try {
        const canAccess = await roleService.canAccessUser(req.user, targetId);

        if (!canAccess) {
          return res.status(403).json({
            success: false,
            message: "Can only manage users in your review center",
          });
        }

        next();
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Review center check error:", error);
        }
        return res.status(500).json({
          success: false,
          message: "Error checking review center access",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }
  };
}

export { PERMISSIONS };
