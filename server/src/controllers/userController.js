import RegistrationApplication from "../models/RegistrationApplication.js";
import User from "../models/User.js";
import { AppError, catchAsync } from "../utils/AppError.js";
import Streak from "../models/Streak.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import UserActivity from "../models/UserActivity.js";
import StudyPlan from "../models/StudyPlan.js";
import Subject from "../models/Subject.js";
import mongoose from "mongoose";

const getMyRegistration = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user.registrationNumber) {
		return next(new AppError("No registration number found for this user", 404));
	}

	const registration = await RegistrationApplication.findOne({ registrationNumber: user.registrationNumber });
	if (!registration) {
		return next(new AppError("Registration application not found", 404));
	}

	res.status(200).json({
		success: true,
		data: registration
	});
});

const getProfile = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id);

	if (!user) {
		return next(new AppError("User not found", 404));
	}

	res.status(200).json({
		success: true,
		data: {
			user,
		},
	});
});

const updateProfile = catchAsync(async (req, res, next) => {
	const allowedFields = [
		'firstName',
		'lastName',
		'bio',
		'isProfileComplete',
		'examType',
		'education',
		'hasTakenExam',
		'previousScore',
		'reviewExperience',
		'struggles',
		'studyMode',
		'studyTime',
		'hoursPerWeek',
		'targetDate',
		'reason',
		'targetScore',
		'showLeaderboard',
		'receiveReminders',
		'studyBuddy'
	];

	const updateData = {};

	Object.keys(req.body).forEach(key => {
		if (allowedFields.includes(key) && req.body[key] !== undefined) {
			updateData[key] = req.body[key];
		}
	});

	const user = await User.findByIdAndUpdate(req.user._id, updateData, {
		new: true,
		runValidators: false,
	});

	res.status(200).json({
		success: true,
		message: "Profile updated successfully",
		data: {
			user,
		},
	});
});

const deleteAccount = catchAsync(async (req, res, next) => {
	const { password } = req.body;

	if (!password) {
		return next(new AppError("Password is required to delete account", 400));
	}

	const user = await User.findById(req.user._id).select("+password");

	if (user.password && !(await user.comparePassword(password))) {
		return next(new AppError("Password is incorrect", 400));
	}

	await User.findByIdAndDelete(req.user._id);

	res.clearCookie("accessToken");
	res.clearCookie("refreshToken");

	res.status(200).json({
		success: true,
		message: "Account deleted successfully",
	});
});

const getActiveDevices = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id).select("refreshTokens");

	const activeDevices = user.refreshTokens
		.filter((token) => token.expiresAt > new Date())
		.map((token) => ({
			id: token._id,
			userAgent: token.userAgent,
			ipAddress: token.ipAddress,
			createdAt: token.createdAt,
			expiresAt: token.expiresAt,
		}));

	res.status(200).json({
		success: true,
		data: {
			devices: activeDevices,
		},
	});
});

const getLevel = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id).select("level exp nextLevelExp");

	if (!user) {
		return next(new AppError("User not found", 404));
	}

	res.status(200).json({
		success: true,
		data: {
			level: user.level || 1,
			exp: user.exp || 0,
			nextLevelExp: user.nextLevelExp || 1000,
		},
	});
});

const getDashboardData = catchAsync(async (req, res, next) => {
	const userId = new mongoose.Types.ObjectId(req.user._id);

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const [user, streakDoc, activePlan, activityDates, categories, weakAreas] = await Promise.all([
		User.findById(userId).select("firstName lastName email role level exp nextLevelExp isEmailVerified isProfileComplete"),
		Streak.findOne({ userId }).lean(),
		StudyPlan.findOne({ isActive: true, enrolledStudents: userId })
			.select("_id batchId name startDate endDate examDate totalWeeks weeks")
			.populate({
				path: "weeks.saturdaySession.subjectId",
				select: "name code icon",
			})
			.populate({
				path: "weeks.saturdaySession.topics",
				select: "name",
			})
			.populate({
				path: "weeks.sundaySession.subjectId",
				select: "name code icon",
			})
			.populate({
				path: "weeks.sundaySession.topics",
				select: "name",
			})
			.lean(),
		UserQuestionHistory.aggregate([
			{ $match: { userId } },
			{ $unwind: "$attempts" },
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$attempts.answeredAt" } },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: -1 } },
			{ $limit: 30 },
		]),
		UserQuestionHistory.aggregate([
			{ $match: { userId } },
			{
				$group: {
					_id: "$subject",
					totalAttempts: { $sum: "$totalAttempts" },
					correctAttempts: { $sum: "$correctAttempts" },
				},
			},
			{ $lookup: { from: "subjects", localField: "_id", foreignField: "_id", as: "subjectInfo" } },
			{ $unwind: "$subjectInfo" },
			{
				$project: {
					category: "$subjectInfo.name",
					accuracy: {
						$cond: [{ $eq: ["$totalAttempts", 0] }, 0, { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }],
					},
				},
			},
		]),
		UserQuestionHistory.aggregate([
			{ $match: { userId } },
			{
				$group: {
					_id: "$topic",
					totalAttempts: { $sum: "$totalAttempts" },
					correctAttempts: { $sum: "$correctAttempts" },
				},
			},
			{
				$project: {
					accuracy: {
						$round: [{ $cond: [{ $eq: ["$totalAttempts", 0] }, 0, { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }] }, 2],
					},
				},
			},
			{ $match: { accuracy: { $lt: 60 }, totalAttempts: { $gte: 5 } } },
			{ $sort: { accuracy: 1 } },
			{ $limit: 5 },
			{ $lookup: { from: "topics", localField: "_id", foreignField: "_id", as: "topicInfo" } },
			{ $unwind: "$topicInfo" },
			{ $project: { topicName: "$topicInfo.name", accuracy: 1 } },
		]),
	]);

	if (!user) {
		return next(new AppError("User not found", 404));
	}

	let streak = streakDoc;
	if (!streak) {
		streak = new Streak({ userId });
		await streak.save();
	}

	const datesWithActivity = new Set(activityDates.map((d) => d._id));
	let currentStreak = 0;
	let longestStreak = 0;
	let tempStreak = 0;

	if (datesWithActivity.size > 0) {
		const sortedDates = Array.from(datesWithActivity).sort((a, b) => new Date(b) - new Date(a));
		const mostRecentDate = new Date(sortedDates[0]);
		mostRecentDate.setHours(0, 0, 0, 0);

		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (mostRecentDate >= yesterday) {
			let checkDate = new Date(mostRecentDate);
			while (true) {
				const dateStr = checkDate.toISOString().split("T")[0];
				if (datesWithActivity.has(dateStr)) {
					currentStreak++;
					checkDate.setDate(checkDate.getDate() - 1);
				} else {
					break;
				}
			}
		}

		const allDates = sortedDates.map((d) => new Date(d)).sort((a, b) => a - b);
		for (let i = 0; i < allDates.length; i++) {
			if (i === 0) {
				tempStreak = 1;
			} else {
				const daysDiff = Math.floor((allDates[i] - allDates[i - 1]) / (1000 * 60 * 60 * 24));
				if (daysDiff === 1) {
					tempStreak++;
				} else {
					if (tempStreak > longestStreak) longestStreak = tempStreak;
					tempStreak = 1;
				}
			}
		}
		if (tempStreak > longestStreak) longestStreak = tempStreak;
	}

	if (currentStreak !== streak.currentStreak || longestStreak !== streak.longestStreak) {
		streak.currentStreak = currentStreak;
		streak.longestStreak = longestStreak;
		streak.lastActivityDate = datesWithActivity.size > 0 ? new Date(Array.from(datesWithActivity).sort().reverse()[0]) : null;
		await Streak.updateOne({ userId }, { currentStreak, longestStreak, lastActivityDate: streak.lastActivityDate });
	}

	const questionHistory = await UserQuestionHistory.find({ userId }).lean();
	let totalAttempts = 0;
	let correctAttempts = 0;
	questionHistory.forEach((h) => {
		totalAttempts += h.totalAttempts;
		correctAttempts += h.correctAttempts;
	});
	const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

	let readiness = "Low";
	if (accuracy >= 80 && totalAttempts > 100) readiness = "High";
	else if (accuracy >= 60 && totalAttempts > 50) readiness = "Medium";

	res.status(200).json({
		success: true,
		data: {
			user: {
				id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isEmailVerified: user.isEmailVerified,
				isProfileComplete: user.isProfileComplete,
				role: user.role,
				level: user.level || 1,
				exp: user.exp || 0,
				nextLevelExp: user.nextLevelExp || 1000,
			},
			streak: {
				currentStreak,
				longestStreak,
			},
			analytics: {
				categories: categories || [],
				weakAreas: weakAreas || [],
				totalQuestions: totalAttempts,
				accuracy: Math.round(accuracy),
				readiness,
			},
			studyPlan: activePlan || null,
		},
	});
});

const revokeDevice = catchAsync(async (req, res, next) => {
	const { deviceId } = req.params;

	const user = await User.findById(req.user._id);
	const tokenToRemove = user.refreshTokens.id(deviceId);

	if (!tokenToRemove) {
		return next(new AppError("Device not found", 404));
	}

	user.refreshTokens.pull(deviceId);
	await user.save();

	res.status(200).json({
		success: true,
		message: "Device revoked successfully",
	});
});

const getAllUsers = catchAsync(async (req, res, next) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const skip = (page - 1) * limit;

	const query = {};
	if (req.query.search) {
		query.$or = [
			{ firstName: { $regex: req.query.search, $options: "i" } },
			{ lastName: { $regex: req.query.search, $options: "i" } },
			{ email: { $regex: req.query.search, $options: "i" } },
		];
	}

	const users = await User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

	const total = await User.countDocuments(query);

	res.status(200).json({
		success: true,
		data: {
			users,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		},
	});
});

const getUserById = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new AppError("User not found", 404));
	}

	res.status(200).json({
		success: true,
		data: {
			user,
		},
	});
});

const updateUserRole = catchAsync(async (req, res, next) => {
	const { role } = req.body;

	if (!["user", "admin"].includes(role)) {
		return next(new AppError("Invalid role", 400));
	}

	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ role },
		{
			new: true,
			runValidators: true,
		}
	);

	if (!user) {
		return next(new AppError("User not found", 404));
	}

	res.status(200).json({
		success: true,
		message: "User role updated successfully",
		data: {
			user,
		},
	});
});

const deleteUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);

	if (!user) {
		return next(new AppError("User not found", 404));
	}

	res.status(200).json({
		success: true,
		message: "User deleted successfully",
	});
});

export default {
	getProfile,
	updateProfile,
	deleteAccount,
	getActiveDevices,
	revokeDevice,
	getAllUsers,
	getUserById,
	updateUserRole,
	deleteUser,
	getLevel,
	getDashboardData,
	getMyRegistration,
};
