import User from "../models/User.js";
import { AppError, catchAsync } from "../utils/AppError.js";

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
		runValidators: true,
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
};
