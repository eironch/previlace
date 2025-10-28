import ManualQuestion from "../models/ManualQuestion.js";
import QuestionTemplate from "../models/QuestionTemplate.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/AppError.js";

const createQuestion = catchAsync(async (req, res, next) => {
	let template = null;

	if (req.body.templateId) {
		template = await QuestionTemplate.findById(req.body.templateId);
		if (!template) {
			return next(new AppError("Template not found", 404));
		}
	}

	const questionData = {
		...req.body,
		createdBy: req.user._id,
		isActive: true,
	};

	try {
		const question = await ManualQuestion.create(questionData);

		if (template) {
			await template.incrementUsage();
		}

		await question.populate([
			{ path: "templateId", select: "name category" },
			{ path: "createdBy", select: "firstName lastName" },
		]);

		res.status(201).json({
			success: true,
			data: { question },
		});
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.error("Create question error:", error);
		}
		return next(error);
	}
});

const getQuestions = catchAsync(async (req, res, next) => {
	const {
		category,
		subjectArea,
		difficulty,
		examLevel,
		status,
		language,
		createdBy,
		page = 1,
		limit = 20,
		search,
		questionType,
		source,
	} = req.query;

	const filters = {};

	if (category) filters.category = category;
	if (subjectArea) filters.subjectArea = subjectArea;
	if (difficulty) filters.difficulty = difficulty;
	if (language) filters.language = language;
	if (questionType) filters.questionType = questionType;
	if (source) filters["metadata.source"] = source;

	if (examLevel) {
		filters.examLevel = { $in: [examLevel, "Both"] };
	}

	let accessQuery;
	if (req.user.role === "admin") {
		accessQuery = { ...filters };
		if (status) {
			const statusArray = Array.isArray(status)
				? status
				: status.split(",").map((s) => s.trim());
			accessQuery.status = { $in: statusArray };
		}
		if (createdBy) accessQuery.createdBy = createdBy;
	} else {
		if (status) {
			const statusArray = Array.isArray(status) ? status : [status];
			accessQuery = {
				...filters,
				$or: [
					{ status: { $in: ["approved", "published"] } },
					{ createdBy: req.user._id, status: { $in: statusArray } },
				],
			};
		} else {
			accessQuery = {
				...filters,
				$or: [
					{ status: { $in: ["approved", "published"] } },
					{ createdBy: req.user._id },
				],
			};
		}
	}

	if (search) {
		accessQuery.$and = [
			accessQuery.$or ? { $or: accessQuery.$or } : {},
			{
				$or: [
					{ questionText: { $regex: search, $options: "i" } },
					{ explanation: { $regex: search, $options: "i" } },
					{ tags: { $in: [new RegExp(search, "i")] } },
				],
			},
		];
		delete accessQuery.$or;
	}

	const skip = (parseInt(page) - 1) * parseInt(limit);

	const [questions, total] = await Promise.all([
		ManualQuestion.find(accessQuery)
			.populate("templateId", "name category")
			.populate("createdBy", "firstName lastName")
			.populate("reviewHistory.reviewerId", "firstName lastName")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit)),
		ManualQuestion.countDocuments(accessQuery),
	]);

	const totalPages = Math.ceil(total / parseInt(limit));

	res.json({
		success: true,
		data: {
			questions,
			pagination: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		},
	});
});

const getQuestionById = catchAsync(async (req, res, next) => {
	const question = await ManualQuestion.findById(req.params.id)
		.populate("templateId", "name category description")
		.populate("createdBy", "firstName lastName")
		.populate("reviewHistory.reviewerId", "firstName lastName");

	if (!question) {
		return next(new AppError("Question not found", 404));
	}

	res.json({
		success: true,
		data: { question },
	});
});

const updateQuestion = catchAsync(async (req, res, next) => {
	const question = await ManualQuestion.findById(req.params.id);

	if (!question) {
		return next(new AppError("Question not found", 404));
	}

	if (
		question.createdBy.toString() !== req.user._id &&
		req.user.role !== "admin"
	) {
		return next(new AppError("Not authorized to update this question", 403));
	}

	if (question.status === "approved" && req.user.role !== "admin") {
		return next(new AppError("Cannot modify approved questions", 403));
	}

	Object.assign(question, req.body);

	if (question.status === "approved") {
		question.status = "review";
		question.metadata.version += 1;
	}

	await question.save();

	await question.populate([
		{ path: "templateId", select: "name category" },
		{ path: "createdBy", select: "firstName lastName" },
	]);

	res.json({
		success: true,
		data: { question },
	});
});

const deleteQuestion = catchAsync(async (req, res, next) => {
	const question = await ManualQuestion.findById(req.params.id);

	if (!question) {
		return next(new AppError("Question not found", 404));
	}

	if (
		question.createdBy.toString() !== req.user._id &&
		req.user.role !== "admin"
	) {
		return next(new AppError("Not authorized to delete this question", 403));
	}

	if (question.usageCount > 0 && req.user.role !== "admin") {
		question.isActive = false;
		await question.save();

		res.json({
			success: true,
			message: "Question archived due to usage history",
		});
	} else {
		await ManualQuestion.findByIdAndDelete(req.params.id);

		res.json({
			success: true,
			message: "Question deleted successfully",
		});
	}
});

const submitForReview = catchAsync(async (req, res, next) => {
	const question = await ManualQuestion.findById(req.params.id);

	if (!question) {
		return next(new AppError("Question not found", 404));
	}

	if (question.createdBy.toString() !== req.user._id) {
		return next(new AppError("Not authorized to submit this question", 403));
	}

	if (question.status !== "draft") {
		return next(new AppError("Question is not in draft status", 400));
	}

	question.status = "review";
	await question.save();

	res.json({
		success: true,
		message: "Question submitted for review",
	});
});

const reviewQuestion = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { action, notes } = req.body;

	if (req.user.role !== "admin") {
		return next(new AppError("Not authorized to review questions", 403));
	}

	const question = await ManualQuestion.findById(id);

	if (!question) {
		return next(new AppError("Question not found", 404));
	}

	const validStates = ["draft", "review"];
	if (!validStates.includes(question.status)) {
		return next(
			new AppError("Question cannot be reviewed in current status", 400)
		);
	}

	if (action === "approved") {
		await question.approve(req.user._id, notes);
	} else if (action === "rejected") {
		if (!notes) {
			return next(new AppError("Rejection notes are required", 400));
		}
		await question.reject(req.user._id, notes);
	} else if (action === "requested_changes") {
		question.reviewHistory.push({
			reviewerId: req.user._id,
			action: "requested_changes",
			notes,
			reviewedAt: new Date(),
		});
		await question.save();
	} else {
		return next(
			new AppError(
				"Invalid action. Use 'approved', 'rejected', or 'requested_changes'",
				400
			)
		);
	}

	await question.populate([
		{ path: "templateId", select: "name category" },
		{ path: "createdBy", select: "firstName lastName" },
		{ path: "reviewHistory.reviewerId", select: "firstName lastName" },
	]);

	res.json({
		success: true,
		data: { question },
	});
});

const publishQuestion = catchAsync(async (req, res, next) => {
	const question = await ManualQuestion.findById(req.params.id);

	if (!question) {
		return next(new AppError("Question not found", 404));
	}

	if (req.user.role !== "admin") {
		return next(new AppError("Not authorized to publish questions", 403));
	}

	if (question.status !== "approved") {
		return next(
			new AppError("Question must be approved before publishing", 400)
		);
	}

	await question.publish();

	await question.populate([
		{ path: "templateId", select: "name category" },
		{ path: "createdBy", select: "firstName lastName" },
		{ path: "reviewHistory.reviewerId", select: "firstName lastName" },
	]);

	res.json({
		success: true,
		data: { question },
	});
});

const sendBackToReview = catchAsync(async (req, res, next) => {
	const question = await ManualQuestion.findById(req.params.id);

	if (!question) {
		return next(new AppError("Question not found", 404));
	}

	if (req.user.role !== "admin") {
		return next(
			new AppError("Not authorized to send back to review", 403)
		);
	}

	if (!["approved", "published"].includes(question.status)) {
		return next(
			new AppError(
				"Only approved or published questions can be sent back to review",
				400
			)
		);
	}

	question.status = "review";
	question.workflowState = "review";
	question.reviewHistory.push({
		reviewerId: req.user._id,
		action: "sent_back_to_review",
		notes: "Question sent back from Question Bank for further review",
		reviewedAt: new Date(),
	});
	question.auditTrail.push({
		action: "sent_back_to_review",
		userId: req.user._id,
		timestamp: new Date(),
	});

	await question.save();

	await question.populate([
		{ path: "templateId", select: "name category" },
		{ path: "createdBy", select: "firstName lastName" },
		{ path: "reviewHistory.reviewerId", select: "firstName lastName" },
	]);

	res.json({
		success: true,
		data: { question },
	});
});

const duplicateQuestion = catchAsync(async (req, res, next) => {
	const originalQuestion = await ManualQuestion.findById(req.params.id);

	if (!originalQuestion) {
		return next(new AppError("Question not found", 404));
	}

	const questionData = originalQuestion.toObject();
	delete questionData._id;
	delete questionData.createdAt;
	delete questionData.updatedAt;
	delete questionData.usageCount;
	delete questionData.correctCount;
	delete questionData.incorrectCount;
	delete questionData.reviewHistory;
	delete questionData.auditTrail;

	questionData.createdBy = req.user._id;
	questionData.status = "draft";
	questionData.metadata.version = 1;
	questionData.questionText = `${questionData.questionText} (Copy)`;

	const duplicatedQuestion = await ManualQuestion.create(questionData);

	await duplicatedQuestion.populate([
		{ path: "templateId", select: "name category" },
		{ path: "createdBy", select: "firstName lastName" },
	]);

	res.status(201).json({
		success: true,
		data: { question: duplicatedQuestion },
		message: "Question duplicated successfully",
	});
});

const getQuestionStats = catchAsync(async (req, res, next) => {
	const stats = await ManualQuestion.getQuestionStats();

	const totalStats = await ManualQuestion.aggregate([
		{
			$group: {
				_id: null,
				total: { $sum: 1 },
				approved: {
					$sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
				},
				pending: {
					$sum: { $cond: [{ $eq: ["$status", "review"] }, 1, 0] },
				},
				draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
				rejected: {
					$sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
				},
			},
		},
	]);

	res.json({
		success: true,
		data: {
			categoryStats: stats,
			overallStats: totalStats[0] || {
				total: 0,
				approved: 0,
				pending: 0,
				draft: 0,
				rejected: 0,
			},
		},
	});
});

const getRandomQuestions = catchAsync(async (req, res, next) => {
	const { category, subjectArea, difficulty, examLevel, limit = 10 } = req.query;

	const filters = {};
	if (category) filters.category = category;
	if (subjectArea) filters.subjectArea = subjectArea;
	if (difficulty) filters.difficulty = difficulty;
	if (examLevel) filters.examLevel = examLevel;

	const questions = await ManualQuestion.getRandomQuestions(
		filters,
		parseInt(limit)
	);

	res.json({
		success: true,
		data: { questions },
	});
});

const getQuestionCounts = catchAsync(async (req, res, next) => {
	const { examLevel, status, source } = req.query;

	const filters = {};

	if (examLevel) {
		filters.examLevel = { $in: [examLevel, "Both"] };
	}

	if (source) {
		filters["metadata.source"] = source;
	}

	let baseQuery;
	if (req.user.role === "admin") {
		baseQuery = { ...filters };
		if (status) {
			const statusArray = Array.isArray(status)
				? status
				: status.split(",").map((s) => s.trim());
			baseQuery.status = { $in: statusArray };
		}
	} else {
		if (status) {
			const statusArray = Array.isArray(status) ? status : [status];
			baseQuery = {
				...filters,
				$or: [
					{ status: { $in: ["approved", "published"] } },
					{ createdBy: req.user._id, status: { $in: statusArray } },
				],
			};
		} else {
			baseQuery = {
				...filters,
				$or: [
					{ status: { $in: ["approved", "published"] } },
					{ createdBy: req.user._id },
				],
			};
		}
	}

	const questionTypes = [
		"multiple_choice",
		"true_false",
		"fill_blank",
		"matching",
		"sequence",
		"essay",
		"numeric",
		"matrix",
	];

	const [totalCount, ...typeCounts] = await Promise.all([
		ManualQuestion.countDocuments(baseQuery),
		...questionTypes.map((type) => {
			const typeQuery = { ...baseQuery, questionType: type };
			if (baseQuery.$or) {
				typeQuery.$or = baseQuery.$or;
			}
			return ManualQuestion.countDocuments(typeQuery);
		}),
	]);

	const counts = { "": totalCount };

	questionTypes.forEach((type, index) => {
		counts[type] = typeCounts[index];
	});

	res.json({
		success: true,
		data: { counts },
	});
});

const validateQuestionContent = catchAsync(async (req, res, next) => {
	const { questionText, options, correctAnswer, questionMath } = req.body;

	const validation = {
		isValid: true,
		errors: [],
		warnings: [],
	};

	if (!questionText || questionText.trim().length < 10) {
		validation.errors.push("Question text must be at least 10 characters long");
		validation.isValid = false;
	}

	if (!options || options.length < 2) {
		validation.errors.push("At least 2 options are required");
		validation.isValid = false;
	}

	if (options) {
		const correctOptions = options.filter((opt) => opt.isCorrect);
		if (correctOptions.length === 0) {
			validation.errors.push("At least one correct option must be selected");
			validation.isValid = false;
		}

		if (correctOptions.length > 1) {
			validation.warnings.push("Multiple correct options detected");
		}
	}

	if (!correctAnswer) {
		validation.errors.push("Correct answer is required");
		validation.isValid = false;
	}

	if (questionMath) {
		try {
			const mathPattern = /^[a-zA-Z0-9+\-*/()^{}\s\\[\]_=<>.,]+$/;
			if (!mathPattern.test(questionMath)) {
				validation.warnings.push(
					"Mathematical expression may contain invalid characters"
				);
			}
		} catch (error) {
			validation.warnings.push("Unable to validate mathematical expression");
		}
	}

	res.json({
		success: true,
		data: { validation },
	});
});

export default {
	createQuestion,
	getQuestions,
	getQuestionById,
	updateQuestion,
	deleteQuestion,
	submitForReview,
	reviewQuestion,
	publishQuestion,
	sendBackToReview,
	duplicateQuestion,
	getQuestionStats,
	getRandomQuestions,
	getQuestionCounts,
	validateQuestionContent,
};
