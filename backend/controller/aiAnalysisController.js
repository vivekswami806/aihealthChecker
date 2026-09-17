import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import aiAnalysisService from '../services/aiAnalysisServices.js';
import reportService from '../services/reportServices.js';
import comparisonService from '../services/comparisonServices.js';
import { enqueueAnalysis } from '../jobs/analysisQueue.js';

export const aiAnalysisController = {
  analyzeReport: asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const report = await reportService.getReport(reportId, req.user.id);

    // Reuse existing analysis if already completed
    if (report.aiAnalysis && report.reportStatus === 'COMPLETED') {
      const medicalHistory = await comparisonService.getDiseaseHistory(req.user.id);
      const latestComparison = await comparisonService.getComparisonHistory(req.user.id, 1, 1);

      return ApiResponse.success(
        res,
        {
          status: 'COMPLETED',
          analysis: report.aiAnalysis,
          comparison: latestComparison.comparisons[0] || null,
          medicalHistory,
          report: {
            id: report.id,
            reportName: report.reportName,
            fileUrl: report.fileUrl,
            uploadDate: report.uploadDate,
          },
        },
        'Existing analysis returned'
      );
    }

    // Already running — tell client to poll
    if (report.reportStatus === 'PROCESSING') {
      return ApiResponse.success(
        res,
        {
          status: 'PROCESSING',
          reportId,
          message: 'Analysis is already in progress',
        },
        'Analysis in progress',
        202
      );
    }

    const result = await enqueueAnalysis(reportId, req.user.id);

    // Inline completion (no Redis)
    if (!result.queued && result.status === 'COMPLETED') {
      const medicalHistory = await comparisonService.getDiseaseHistory(req.user.id);
      return ApiResponse.success(
        res,
        {
          status: 'COMPLETED',
          analysis: result.analysis,
          comparison: result.comparison,
          medicalHistory,
          report: {
            id: report.id,
            reportName: report.reportName,
            fileUrl: report.fileUrl,
            uploadDate: report.uploadDate,
          },
        },
        'Report analyzed successfully',
        201
      );
    }

    // Queued — client should poll GET /api/ai/:reportId/status
    return ApiResponse.success(
      res,
      {
        status: 'PROCESSING',
        reportId,
        jobId: result.jobId || null,
        message: 'Analysis queued. Poll /api/ai/:reportId/status for results.',
      },
      'Analysis started',
      202
    );
  }),

  getAnalysisStatus: asyncHandler(async (req, res) => {
    const status = await aiAnalysisService.getAnalysisStatus(
      req.params.reportId,
      req.user.id
    );
    return ApiResponse.success(res, status, 'Analysis status fetched');
  }),

  getAnalysis: asyncHandler(async (req, res) => {
    const analysis = await aiAnalysisService.getAnalysis(req.params.id, req.user.id);
    return ApiResponse.success(res, analysis, 'Analysis fetched successfully');
  }),

  getAnalysisByReport: asyncHandler(async (req, res) => {
    const analysis = await aiAnalysisService.getAnalysisByReportId(
      req.params.reportId,
      req.user.id
    );
    const medicalHistory = await comparisonService.getDiseaseHistory(req.user.id);
    return ApiResponse.success(
      res,
      { analysis, medicalHistory },
      'Analysis fetched successfully'
    );
  }),

  getAnalysisHistory: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { analyses, total } = await aiAnalysisService.getAnalysisHistory(
      req.user.id,
      page,
      limit
    );
    return ApiResponse.paginated(
      res,
      analyses,
      total,
      page,
      limit,
      'Analysis history fetched successfully'
    );
  }),
};

export default aiAnalysisController;
