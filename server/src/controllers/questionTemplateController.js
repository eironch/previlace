import QuestionTemplate from "../models/QuestionTemplate.js";
import ManualQuestion from "../models/ManualQuestion.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/AppError.js";

const getTemplates = catchAsync(async (req, res, next) => {
	const { category, examLevel, search } = req.query;
	
	let query = { isActive: true };
	
	if (category) {
		query.category = category;
	}
	
	if (examLevel) {
		query.$or = [
			{ examLevel },
			{ examLevel: "Both" }
		];
	}
	
	if (search) {
		query.$or = [
			{ name: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } }
		];
	}
	
	const templates = await QuestionTemplate.find(query)
		.populate("createdBy", "firstName lastName")
		.sort({ usageCount: -1, createdAt: -1 });
	
	res.json({
		success: true,
		data: { templates }
	});
});

const getTemplateById = catchAsync(async (req, res, next) => {
	const template = await QuestionTemplate.findById(req.params.id)
		.populate("createdBy", "firstName lastName");
	
	if (!template) {
		return next(new AppError("Template not found", 404));
	}
	
	res.json({
		success: true,
		data: { template }
	});
});

const createTemplate = catchAsync(async (req, res, next) => {
	const templateData = {
	...req.body,
	createdBy: req.user._id
	};
	
	const template = await QuestionTemplate.create(templateData);
	
	await template.populate("createdBy", "firstName lastName");
	
	res.status(201).json({
		success: true,
		data: { template }
	});
});

const updateTemplate = catchAsync(async (req, res, next) => {
	const template = await QuestionTemplate.findById(req.params.id);
	
	if (!template) {
		return next(new AppError("Template not found", 404));
	}
	
	if (template.createdBy.toString() !== req.user._id && req.user.role !== "admin") {
		return next(new AppError("Not authorized to update this template", 403));
	}
	
	Object.assign(template, req.body);
	await template.save();
	
	await template.populate("createdBy", "firstName lastName");
	
	res.json({
		success: true,
		data: { template }
	});
});

const deleteTemplate = catchAsync(async (req, res, next) => {
	const template = await QuestionTemplate.findById(req.params.id);
	
	if (!template) {
		return next(new AppError("Template not found", 404));
	}
	
	if (template.createdBy.toString() !== req.user._id && req.user.role !== "admin") {
		return next(new AppError("Not authorized to delete this template", 403));
	}
	
	const questionsUsingTemplate = await ManualQuestion.countDocuments({ templateId: template._id });
	
	if (questionsUsingTemplate > 0) {
		template.isActive = false;
		await template.save();
	} else {
		await QuestionTemplate.findByIdAndDelete(req.params.id);
	}
	
	res.json({
		success: true,
		message: "Template deleted successfully"
	});
});

const getTemplateCategories = catchAsync(async (req, res, next) => {
	const categories = [
		{
			name: "Vocabulary",
			description: "Word meanings, synonyms, antonyms, and context usage",
			subjectArea: "Verbal Ability",
			templates: ["Synonyms", "Antonyms", "Word Meanings", "Context Usage"]
		},
		{
			name: "Grammar", 
			description: "Grammar rules, error identification, and sentence construction",
			subjectArea: "Verbal Ability",
			templates: ["Error Identification", "Correct Usage", "Sentence Construction", "Punctuation"]
		},
		{
			name: "Reading Comprehension",
			description: "Passage comprehension and analysis questions",
			subjectArea: "Verbal Ability", 
			templates: ["Short Passage", "Long Passage", "Factual Questions", "Inferential Questions"]
		},
		{
			name: "Mathematics",
			description: "Mathematical operations, word problems, and calculations",
			subjectArea: "Numerical Ability",
			templates: ["Basic Operations", "Fractions", "Word Problems", "Percentage Calculations", "Graph Interpretation"]
		},
		{
			name: "General Information",
			description: "Philippine constitution, laws, current events, and rights",
			subjectArea: "General Information",
			templates: ["Philippine Constitution", "RA 6713", "Current Events", "Peace and Human Rights"]
		},
		{
			name: "Clerical",
			description: "Filing, spelling, and basic clerical operations",
			subjectArea: "Clerical Ability",
			templates: ["Alphabetical Filing", "Spelling", "Basic Operations"],
			examLevel: "Subprofessional"
		},
		{
			name: "Analytical Reasoning",
			description: "Logic problems, patterns, and data interpretation",
			subjectArea: "Logic",
			templates: ["Logic Problems", "Pattern Recognition", "Data Interpretation"]
		}
	];
	
	res.json({
		success: true,
		data: { categories }
	});
});

const getPopularTemplates = catchAsync(async (req, res, next) => {
	const { limit = 5 } = req.query;
	
	const templates = await QuestionTemplate.getPopularTemplates(parseInt(limit));
	
	res.json({
		success: true,
		data: { templates }
	});
});

export default {
	getTemplates,
	getTemplateById,
	createTemplate,
	updateTemplate,
	deleteTemplate,
	getTemplateCategories,
	getPopularTemplates,
};
