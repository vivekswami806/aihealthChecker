import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import aiAnalysisService from '../services/aiAnalysisServices.js';
import reportService from '../services/reportServices.js';
import notificationService from '../services/notificationServices.js';
import comparisonService from '../services/comparisonServices.js';

export const aiAnalysisController = {
  analyzeReport: asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const report = await reportService.getReport(reportId, req.user.id);

    // Reuse existing analysis if already completed
    if (report.aIAnalysis && report.reportStatus === 'COMPLETED') {
      const medicalHistory = await comparisonService.getDiseaseHistory(req.user.id);
      const latestComparison = await comparisonService.getComparisonHistory(
        req.user.id,
        1,
        1
      );

      return ApiResponse.success(
        res,
        {
          analysis: report.aIAnalysis,
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

    const analysis = await aiAnalysisService.analyzeWithGeminiGoogle(
      reportId,
      req.user.id,
      report.extractedText,
      report.fileUrl,
      report.reportType || report.mimeType
    );

    const comparison = await comparisonService.compareWithPrevious(
      req.user.id,
      reportId
    );

    const medicalHistory = await comparisonService.getDiseaseHistory(req.user.id);

    await notificationService.createInAppNotification(
      req.user.id,
      'Report Analysis Complete',
      `Your medical report "${report.reportName}" has been analyzed successfully.`,
      'INFO'
    );

    if (comparison?.detectedChanges?.worsening?.length) {
      await notificationService.createInAppNotification(
        req.user.id,
        'Health Trend Alert',
        comparison.comparisonSummary,
        'WARNING'
      );
    }

    return ApiResponse.success(
      res,
      {
        analysis,
        comparison,
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
