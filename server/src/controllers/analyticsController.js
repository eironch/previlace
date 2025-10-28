import { AppError, catchAsync } from "../utils/AppError.js";
import performanceAnalysisService from "../services/performanceAnalysisService.js";

const getCategoryStatistics = catchAsync(async (req, res, next) => {
  const stats = await performanceAnalysisService.calculateCategoryStatistics(req.user._id);

  res.json({
    success: true,
    data: { categoryStats: stats },
  });
});

const getWeakAreas = catchAsync(async (req, res, next) => {
  const weakAreas = await performanceAnalysisService.identifyWeakAreas(req.user._id);

  res.json({
    success: true,
    data: { weakAreas },
  });
});

const getExamReadiness = catchAsync(async (req, res, next) => {
  const readiness = await performanceAnalysisService.calculateExamReadiness(req.user._id);

  res.json({
    success: true,
    data: { readiness },
  });
});

const getProgressReport = catchAsync(async (req, res, next) => {
  const { days = 30 } = req.query;

  const report = await performanceAnalysisService.generateProgressReport(req.user._id, parseInt(days));

  res.json({
    success: true,
    data: { report },
  });
});

const getPercentileRank = catchAsync(async (req, res, next) => {
  const { metric = "averageScore" } = req.query;

  const ranking = await performanceAnalysisService.getPercentileRank(req.user._id, metric);

  res.json({
    success: true,
    data: { ranking },
  });
});

export default {
  getCategoryStatistics,
  getWeakAreas,
  getExamReadiness,
  getProgressReport,
  getPercentileRank,
};
