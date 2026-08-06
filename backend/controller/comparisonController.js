import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import comparisonService from '../services/comparisonService.js';
import prisma from '../config/database.js';

export const comparisonController = {
  compareReports: asyncHandler(async (req, res) => {
    const { oldReportId, newReportId } = req.body;

    const comparison = await comparisonService.compareReports(
      req.user.id,
      oldReportId,
      newReportId
    );

    return ApiResponse.success(res, comparison, 'Reports compared successfully', 201);
  }),

  getDiseaseHistory: asyncHandler(async (req, res) => {
    const diseases = await comparisonService.getDiseaseHistory(req.user.id);
    return ApiResponse.success(res, diseases, 'Disease history fetched successfully');
  }),

  getComparisonHistory: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { comparisons, total } = await comparisonService.getComparisonHistory(
      req.user.id,
      page,
      limit
    );

    return ApiResponse.paginated(
      res,
      comparisons,
      total,
      page,
      limit,
      'Comparison history fetched successfully'
    );
  }),

  getHealthTimeline: asyncHandler(async (req, res) => {
    const timeline = await comparisonService.getHealthTimeline(req.user.id);
    return ApiResponse.success(res, timeline, 'Health timeline fetched successfully');
  }),

  createHealthScore: asyncHandler(async (req, res) => {
    const { bmi, blood_pressure, sugar_level, cholesterol_level, heart_rate } =
      req.body;

    // Calculate overall score (basic algorithm)
    let score = 100;
    if (bmi && (bmi < 18.5 || bmi > 29.9)) score -= 15;
    if (sugar_level && (sugar_level < 70 || sugar_level > 140)) score -= 15;
    if (cholesterol_level && cholesterol_level > 200) score -= 15;

    const healthScore = await prisma.healthScore.create({
      data: {
        user_id: req.user.id,
        overall_score: Math.max(0, score),
        bmi,
        blood_pressure,
        sugar_level,
        cholesterol_level,
        heart_rate,
      },
    });

    return ApiResponse.success(
      res,
      healthScore,
      'Health score recorded successfully',
      201
    );
  }),

  getHealthScores: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [scores, total] = await Promise.all([
      prisma.healthScore.findMany({
        where: { user_id: req.user.id },
        skip,
        take: limit,
        orderBy: { calculated_at: 'desc' },
      }),
      prisma.healthScore.count({ where: { user_id: req.user.id } }),
    ]);

    return ApiResponse.paginated(
      res,
      scores,
      total,
      page,
      limit,
      'Health scores fetched successfully'
    );
  }),

  getLatestHealthScore: asyncHandler(async (req, res) => {
    const score = await prisma.healthScore.findFirst({
      where: { user_id: req.user.id },
      orderBy: { calculated_at: 'desc' },
    });

    return ApiResponse.success(res, score, 'Latest health score fetched successfully');
  }),
};

export default comparisonController;