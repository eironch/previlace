import { AppError } from "../utils/AppError.js";

export const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePassword = (password) => {
	return password && password.length >= 6;
};

export const validateName = (name) => {
	return name && name.trim().length >= 2;
};

export const validateRegister = (req, res, next) => {
	const { email, password } = req.body;
	const errors = [];

	if (!email || !validateEmail(email)) {
		errors.push("Valid email is required");
	}

	if (!password || !validatePassword(password)) {
		errors.push("Password must be at least 6 characters");
	}

	if (errors.length > 0) {
		return next(new AppError(errors.join(", "), 400));
	}

	next();
};

export const validateLogin = (req, res, next) => {
	const { email, password } = req.body;
	const errors = [];

	if (!email || !validateEmail(email)) {
		errors.push("Valid email is required");
	}

	if (!password) {
		errors.push("Password is required");
	}

	if (errors.length > 0) {
		return next(new AppError(errors.join(", "), 400));
	}

	next();
};

export const validateOnboarding = (req, res, next) => {
	const { firstName, lastName } = req.body;
	const errors = [];

	if (!firstName || !validateName(firstName)) {
		errors.push("First name must be at least 2 characters");
	}

	if (!lastName || !validateName(lastName)) {
		errors.push("Last name must be at least 2 characters");
	}

	if (errors.length > 0) {
		return next(new AppError(errors.join(", "), 400));
	}

	next();
};

export const validateForgotPassword = (req, res, next) => {
	const { email } = req.body;
	const errors = [];

	if (!email || !validateEmail(email)) {
		errors.push("Valid email is required");
	}

	if (errors.length > 0) {
		return next(new AppError(errors.join(", "), 400));
	}

	next();
};

export const validateResetPassword = (req, res, next) => {
	const { token, password } = req.body;
	const errors = [];

	if (!token) {
		errors.push("Reset token is required");
	}

	if (!password || !validatePassword(password)) {
		errors.push("Password must be at least 6 characters");
	}

	if (errors.length > 0) {
		return next(new AppError(errors.join(", "), 400));
	}

	next();
};

export const validateUpdateProfile = (req, res, next) => {
	const { firstName, lastName, bio } = req.body;
	const errors = [];

	if (firstName !== undefined && !validateName(firstName)) {
		errors.push("First name must be at least 2 characters");
	}

	if (lastName !== undefined && !validateName(lastName)) {
		errors.push("Last name must be at least 2 characters");
	}

	if (bio !== undefined && bio.length > 500) {
		errors.push("Bio must be less than 500 characters");
	}

	if (errors.length > 0) {
		return next(new AppError(errors.join(", "), 400));
	}

	next();
};

// Keep the old function name for backward compatibility
export const validatePasswordReset = validateForgotPassword;
