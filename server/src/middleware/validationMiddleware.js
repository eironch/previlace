import { body, query, validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new AppError(errorMessages.join(", "), 400));
  }
  next();
}

export const validateRegister = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("Password must contain uppercase, lowercase, number, and special character"),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be less than 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be less than 50 characters"),
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

export const validateUpdateProfile = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must be 500 characters or less"),
  handleValidationErrors,
];

export const validateForgotPassword = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  handleValidationErrors,
];

export const validateResetPassword = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("Password must contain uppercase, lowercase, number, and special character"),
  handleValidationErrors,
];

export function validateQuizConfig(req, res, next) {
  const {
    mode = "practice",
    categories,
    difficulty,
    examLevel,
    questionCount = 10,
    timeLimit = 600,
  } = req.body;

  if (!["practice", "timed", "mock", "custom", "adaptive", "spaced-repetition"].includes(mode)) {
    return next(new AppError("Invalid quiz mode", 400));
  }

  if (mode === "mock") {
    if (!examLevel || !["professional", "sub-professional"].includes(examLevel)) {
      return next(new AppError("Valid exam level required for mock exam", 400));
    }
  }

  if (questionCount > 200 || questionCount < 1) {
    return next(new AppError("Question count must be between 1 and 200", 400));
  }

  if (timeLimit > 14400 || timeLimit < 60) {
    return next(new AppError("Time limit must be between 1 minute and 4 hours", 400));
  }

  next();
}

export function validateStudyPlan(req, res, next) {
  const { targetDate } = req.body;

  if (!targetDate) {
    return next(new AppError("Target exam date is required", 400));
  }

  const target = new Date(targetDate);
  const today = new Date();
  
  if (target <= today) {
    return next(new AppError("Target date must be in the future", 400));
  }

  const maxDaysAhead = 365;
  const daysDifference = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  
  if (daysDifference > maxDaysAhead) {
    return next(new AppError("Target date cannot be more than one year ahead", 400));
  }

  next();
}

export function validateStudySession(req, res, next) {
  const { category, questionsAnswered, timeSpent, accuracy } = req.body;

  if (!category || !questionsAnswered || timeSpent === undefined || accuracy === undefined) {
    return next(new AppError("All session data fields are required", 400));
  }

  if (questionsAnswered < 1 || questionsAnswered > 200) {
    return next(new AppError("Questions answered must be between 1 and 200", 400));
  }

  if (timeSpent < 0 || timeSpent > 86400000) {
    return next(new AppError("Invalid time spent value", 400));
  }

  if (accuracy < 0 || accuracy > 100) {
    return next(new AppError("Accuracy must be between 0 and 100", 400));
  }

  next();
}

export function validateAnswerSubmission(req, res, next) {
  const { questionId, answer, timeSpent } = req.body;

  if (!questionId || answer === undefined || answer === null) {
    return next(new AppError("Question ID and answer are required", 400));
  }

  if (timeSpent !== undefined && (timeSpent < 0 || timeSpent > 600000)) {
    return next(new AppError("Invalid time spent value", 400));
  }

  next();
}

export const validateExamReadiness = [
  query("examLevel")
    .optional()
    .isIn(["professional", "sub-professional"])
    .withMessage("Invalid exam level"),
];

export const validateSpacedRepetition = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("days")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("Days must be between 1 and 30"),
];

export function validateStudyGroup(req, res, next) {
  const { name, memberLimit, category } = req.body;

  if (!name || name.trim().length === 0) {
    return next(new AppError("Group name is required", 400));
  }

  if (name.trim().length > 100) {
    return next(new AppError("Group name must be 100 characters or less", 400));
  }

  if (memberLimit && (memberLimit < 2 || memberLimit > 100)) {
    return next(new AppError("Member limit must be between 2 and 100", 400));
  }

  if (category && !["general", "professional", "sub-professional", "mixed"].includes(category)) {
    return next(new AppError("Invalid category", 400));
  }

  next();
}

export function validateMessage(req, res, next) {
  const { content, messageType } = req.body;

  if (!content || content.trim().length === 0) {
    return next(new AppError("Message content is required", 400));
  }

  if (content.trim().length > 2000) {
    return next(new AppError("Message content must be 2000 characters or less", 400));
  }

  if (messageType && !["text", "quiz_share", "file", "system", "announcement"].includes(messageType)) {
    return next(new AppError("Invalid message type", 400));
  }

  next();
}

export function validateMemberAction(req, res, next) {
  const { action, role } = req.body;

  if (!action) {
    return next(new AppError("Action is required", 400));
  }

  if (!["promote", "demote", "ban", "approve"].includes(action)) {
    return next(new AppError("Invalid action", 400));
  }

  if (action === "promote" && !role) {
    return next(new AppError("Role is required for promotion", 400));
  }

  if (role && !["admin", "moderator", "member"].includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  next();
}
