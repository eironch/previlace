import { PERMISSIONS } from "./permissions.js";

export const ROLE_PERMISSIONS = {
  student: [
    PERMISSIONS.USER_READ_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.USER_DELETE_OWN,
    PERMISSIONS.QUESTION_READ_OWN,
    PERMISSIONS.EXAM_TAKE_OWN,
    PERMISSIONS.EXAM_VIEW_OWN,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.JOB_VIEW_OWN,
    PERMISSIONS.JOB_APPLY_OWN,
    PERMISSIONS.RESUME_MANAGE_OWN,
    PERMISSIONS.INTERVIEW_PREP_OWN,
    PERMISSIONS.GROUP_CREATE_OWN,
    PERMISSIONS.GROUP_MANAGE_OWN,
  ],
  admin: [
    PERMISSIONS.USER_READ_CENTER,
    PERMISSIONS.USER_UPDATE_CENTER,
    PERMISSIONS.USER_DELETE_CENTER,
    PERMISSIONS.USER_CREATE_CENTER,
    PERMISSIONS.QUESTION_READ_CENTER,
    PERMISSIONS.QUESTION_CREATE_CENTER,
    PERMISSIONS.QUESTION_UPDATE_CENTER,
    PERMISSIONS.QUESTION_DELETE_CENTER,
    PERMISSIONS.QUESTION_APPROVE_CENTER,
    PERMISSIONS.EXAM_VIEW_CENTER,
    PERMISSIONS.EXAM_CREATE_CENTER,
    PERMISSIONS.ANALYTICS_VIEW_CENTER,
    PERMISSIONS.REVIEW_CENTER_MANAGE,
    PERMISSIONS.ROLE_MANAGE_CENTER,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.GROUP_VIEW_CENTER,
    PERMISSIONS.GROUP_MANAGE_CENTER,
  ],
  super_admin: [
    PERMISSIONS.USER_READ_ALL,
    PERMISSIONS.USER_UPDATE_ALL,
    PERMISSIONS.USER_DELETE_ALL,
    PERMISSIONS.USER_CREATE_ALL,
    PERMISSIONS.QUESTION_READ_ALL,
    PERMISSIONS.QUESTION_CREATE_ALL,
    PERMISSIONS.QUESTION_UPDATE_ALL,
    PERMISSIONS.QUESTION_DELETE_ALL,
    PERMISSIONS.QUESTION_APPROVE_ALL,
    PERMISSIONS.EXAM_VIEW_ALL,
    PERMISSIONS.EXAM_CREATE_ALL,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.REVIEW_CENTER_VIEW_ALL,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.SYSTEM_AUDIT_VIEW,
    PERMISSIONS.ROLE_MANAGE_ALL,
    PERMISSIONS.CONTENT_APPROVE,
  ],
};

export const ROLE_HIERARCHY = {
  student: 1,
  admin: 2,
  super_admin: 3,
};

export function getRolePermissions(role) {
  const directPermissions = ROLE_PERMISSIONS[role] || [];
  
  if (role === "admin") {
    return [...ROLE_PERMISSIONS.student, ...directPermissions];
  }
  
  if (role === "super_admin") {
    return [...ROLE_PERMISSIONS.student, ...ROLE_PERMISSIONS.admin, ...directPermissions];
  }
  
  return directPermissions;
}

export function hasPermission(userRole, requiredPermission) {
  const permissions = getRolePermissions(userRole);
  return permissions.includes(requiredPermission);
}

export function hasAnyPermission(userRole, requiredPermissions) {
  const permissions = getRolePermissions(userRole);
  return requiredPermissions.some(perm => permissions.includes(perm));
}

export function hasAllPermissions(userRole, requiredPermissions) {
  const permissions = getRolePermissions(userRole);
  return requiredPermissions.every(perm => permissions.includes(perm));
}

export function isRoleHigher(role1, role2) {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

export function canManageRole(managerRole, targetRole) {
  if (managerRole === "super_admin") return true;
  if (managerRole === "admin") return targetRole === "student";
  return false;
}
