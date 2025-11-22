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
  instructor: [
    PERMISSIONS.USER_READ_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.INSTRUCTOR_AVAILABILITY_MANAGE,
    PERMISSIONS.INSTRUCTOR_STUDENTS_VIEW,
    PERMISSIONS.INSTRUCTOR_MESSAGES_VIEW,
    PERMISSIONS.INSTRUCTOR_MESSAGES_REPLY,
    PERMISSIONS.INSTRUCTOR_ANALYTICS_VIEW,
    PERMISSIONS.INSTRUCTOR_CONTENT_CONTRIBUTE,
    PERMISSIONS.QUESTION_READ_CENTER,
    PERMISSIONS.ANALYTICS_VIEW_CENTER,
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
  instructor: 2,
  admin: 3,
  super_admin: 4,
};

export function getRolePermissions(role) {
  const directPermissions = ROLE_PERMISSIONS[role] || [];
  
  if (role === "instructor") {
    return [...ROLE_PERMISSIONS.student, ...directPermissions];
  }
  
  if (role === "admin") {
    return [...ROLE_PERMISSIONS.student, ...ROLE_PERMISSIONS.instructor, ...directPermissions];
  }
  
  if (role === "super_admin") {
    return [...ROLE_PERMISSIONS.student, ...ROLE_PERMISSIONS.instructor, ...ROLE_PERMISSIONS.admin, ...directPermissions];
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
  if (managerRole === "admin") return ["student", "instructor"].includes(targetRole);
  return false;
}
