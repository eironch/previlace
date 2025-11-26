import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/AppError.js";

dotenv.config();

const setTokenCookies = (res, accessToken, refreshToken) => {
	const isProduction = process.env.NODE_ENV === "production";
	const cookieOptions = {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "None" : "Lax",
	};

	res.cookie("accessToken", accessToken, {
		...cookieOptions,
		maxAge: 60 * 60 * 1000,
	});

	res.cookie("refreshToken", refreshToken, {
		...cookieOptions,
		maxAge: 30 * 24 * 60 * 60 * 1000,
	});
};

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || "1h",
	});

	const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
		expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
	});

	return { accessToken, refreshToken };
};



const login = catchAsync(async (req, res, next) => {
	const { identifier, password } = req.body;

	if (!identifier || !password) {
		return next(new AppError("Please provide identifier and password", 400));
	}

	// Check if identifier is email or studentId
	const user = await User.findOne({
		$or: [{ email: identifier }, { studentId: identifier }]
	}).select("+password");

	if (!user) {
		return next(new AppError("Invalid credentials", 401));
	}

	const isPasswordValid = await user.comparePassword(password);
	if (!isPasswordValid) {
		return next(new AppError("Invalid credentials", 401));
	}

	await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

	const { accessToken, refreshToken } = generateTokens(user._id);
	
	await user.addRefreshToken(
		refreshToken,
		req.headers["user-agent"],
		req.ip || req.connection.remoteAddress
	);

	setTokenCookies(res, accessToken, refreshToken);

	res.json({
		success: true,
		data: {
			user: {
				id: user._id,
				email: user.email,
				studentId: user.studentId,
				firstName: user.firstName,
				lastName: user.lastName,
				isEmailVerified: user.isEmailVerified,
				isProfileComplete: user.isProfileComplete,
				role: user.role,
				avatar: user.avatar
			},
			accessToken,
			refreshToken
		}
	});
});

const logout = catchAsync(async (req, res, next) => {
	const { refreshToken } = req.cookies;

	if (refreshToken) {
		try {
			const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
			const user = await User.findById(decoded.userId);
			if (user) {
				await user.removeRefreshToken(refreshToken);
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Refresh token removal error:", error);
			}
		}
	}

	res.clearCookie("accessToken", {
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
	});
	res.clearCookie("refreshToken", {
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
	});
	res.json({ success: true, message: "Logged out successfully" });
});

const logoutAll = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (user) {
		user.refreshTokens = [];
		await user.save();
	}

	res.clearCookie("accessToken", {
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
	});
	res.clearCookie("refreshToken", {
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
	});
	res.json({ success: true, message: "Logged out from all devices" });
});

const forgotPassword = catchAsync(async (req, res, next) => {
	const { email } = req.body;

	const user = await User.findOne({ email });
	if (!user) {
		return res.json({ success: true, message: "If account exists, reset email sent" });
	}

	const resetToken = crypto.randomBytes(32).toString("hex");
	const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

	await User.findByIdAndUpdate(user._id, {
		passwordResetToken: resetToken,
		passwordResetExpires,
	});

	res.json({ 
		success: true, 
		message: "If account exists, reset email sent",
		...(process.env.NODE_ENV !== "production" && { resetToken })
	});
});

const resetPassword = catchAsync(async (req, res, next) => {
	const { token, password } = req.body;

	if (!token || !password) {
		return next(new AppError("Token and password required", 400));
	}

	const user = await User.findOne({
		passwordResetToken: token,
		passwordResetExpires: { $gt: Date.now() },
	});

	if (!user) {
		return next(new AppError("Invalid or expired reset token", 400));
	}

	user.password = password;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	res.json({ success: true, message: "Password reset successfully" });
});

const verifyEmail = catchAsync(async (req, res, next) => {
	const { token } = req.params;

	const user = await User.findOne({
		emailVerificationToken: token,
		emailVerificationExpires: { $gt: Date.now() },
	});

	if (!user) {
		return next(new AppError("Invalid or expired verification token", 400));
	}

	await User.findByIdAndUpdate(user._id, {
		isEmailVerified: true,
		emailVerificationToken: undefined,
		emailVerificationExpires: undefined,
	});

	res.json({ success: true, message: "Email verified successfully" });
});

const resendEmailVerification = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	
	if (user.isEmailVerified) {
		return next(new AppError("Email already verified", 400));
	}

	const emailVerificationToken = crypto.randomBytes(32).toString("hex");
	const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

	await User.findByIdAndUpdate(user._id, {
		emailVerificationToken,
		emailVerificationExpires,
	});

	res.json({ 
		success: true, 
		message: "Verification email sent",
		...(process.env.NODE_ENV !== "production" && { emailVerificationToken })
	});
});

const getMe = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id);

	if (!user) {
		return next(new AppError("User not found", 404));
	}

	res.json({
		success: true,
		data: {
			user: {
				id: user._id,
				email: user.email,
				studentId: user.studentId,
				firstName: user.firstName,
				lastName: user.lastName,
				avatar: user.avatar,
				isEmailVerified: user.isEmailVerified,
				isProfileComplete: user.isProfileComplete,
				role: user.role,
			}
		}
	});
});

const updatePassword = catchAsync(async (req, res, next) => {
	const { currentPassword, newPassword } = req.body;

	const user = await User.findById(req.user._id).select("+password");
	
	const isCurrentPasswordValid = await user.comparePassword(currentPassword);
	if (!isCurrentPasswordValid) {
		return next(new AppError("Current password is incorrect", 401));
	}

	user.password = newPassword;
	await user.save();

	res.json({ success: true, message: "Password updated successfully" });
});

const refreshToken = catchAsync(async (req, res, next) => {
	const { refreshToken } = req.cookies;

	if (!refreshToken) {
		return next(new AppError("Refresh token required", 401));
	}

	try {
		const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return next(new AppError("User not found", 401));
		}

		const isRefreshTokenValid = user.refreshTokens.some(
			tokenObj => tokenObj.token === refreshToken && tokenObj.expiresAt > new Date()
		);

		if (!isRefreshTokenValid) {
			return next(new AppError("Invalid or expired refresh token", 401));
		}

		const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

		await user.removeRefreshToken(refreshToken);
		await user.addRefreshToken(
			newRefreshToken,
			req.headers["user-agent"],
			req.ip || req.connection.remoteAddress
		);

		setTokenCookies(res, newAccessToken, newRefreshToken);

		res.json({
			success: true,
			data: {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken
			}
		});
	} catch (error) {
		return next(new AppError("Invalid refresh token", 401));
	}
});

export default {
	login,
	logout,
	logoutAll,
	forgotPassword,
	resetPassword,
	verifyEmail,
	resendEmailVerification,
	getMe,
	updatePassword,
	refreshToken,
};
