import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import comparisonService from '../services/comparisonServices.js';
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
    const { bmi, bloodPressure, sugarLevel, cholesterolLevel } = req.body;

    let score = 100;
    if (bmi && (bmi < 18.5 || bmi > 29.9)) score -= 15;
    if (sugarLevel && (sugarLevel < 70 || sugarLevel > 140)) score -= 15;
    if (cholesterolLevel && cholesterolLevel > 200) score -= 15;

    const healthScore = await prisma.healthScore.create({
      data: {
        userId: req.user.id,
        score: Math.max(0, score),
        bmi: bmi ?? null,
        bloodPressure: bloodPressure ?? null,
        sugarLevel: sugarLevel ?? null,
        cholesterolLevel: cholesterolLevel ?? null,
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
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { calculatedAt: 'desc' },
      }),
      prisma.healthScore.count({ where: { userId: req.user.id } }),
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
      where: { userId: req.user.id },
      orderBy: { calculatedAt: 'desc' },
    });

    return ApiResponse.success(res, score, 'Latest health score fetched successfully');
  }),
};

export default comparisonController;
