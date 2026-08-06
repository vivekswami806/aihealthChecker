import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import aiAnalysisService from '../services/aiAnalysisServices.js';
import reportService from '../services/reportServices.js';
import notificationService from '../services/notificationServices.js';
export const aiAnalysisController = {
  analyzeReport: asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const { useGemini } = req.body;

    const report = await reportService.getReport(reportId, req.user.id);

    let analysis;
    // ✅ Pass fileUrl and reportType
    if (true) {
      analysis = await aiAnalysisService.analyzeWithGeminiGoogle(
        reportId,
        req.user.id,
        report.extractedText,
        report.fileUrl, // ✅ Add this
        report.reportType // ✅ Add this
      );
    } 
    // else 
    // {
    //   analysis = await aiAnalysisService.analyzeReport(
    //     reportId,
    //     req.user.id,
    //     report.extractedText,
    //     report.fileUrl, // ✅ Add this
    //     report.reportType // ✅ Add this
    //   );
    // }

    await notificationService.createInAppNotification(
      req.user.id,
      'Report Analysis Complete',
      `Your medical report "${report.reportName}" has been analyzed successfully.`,
      'success',
      `/dashboard/analysis/${analysis.id}`
    );

    return ApiResponse.success(res, analysis, 'Report analyzed successfully', 201);
  }),

  getAnalysis: asyncHandler(async (req, res) => {
    const analysis = await aiAnalysisService.getAnalysis(req.params.id, req.user.id);
    return ApiResponse.success(res, analysis, 'Analysis fetched successfully');
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