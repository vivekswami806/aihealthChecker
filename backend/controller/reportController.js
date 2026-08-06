import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import reportService from '../services/reportServices.js';
import notificationService from '../services/notificationServices.js';

export const reportController = {
  uploadReport: asyncHandler(async (req, res) => {
    if (!req.file) {
      return ApiResponse.error(res, 'No file uploaded', 400);
    }

    const { report_name, report_type } = req.body;
    console.log("---re, port_name, report_type", report_name, report_type);
    const report = await reportService.uploadReport(
      req.user.id,
      req.file,
      report_name,
      report_type
    );

    // Notify user
    await notificationService.createInAppNotification(
      req.user.id,
      'Report Uploaded',
      `Your report "${report_name}" has been uploaded and is being processed.`,
      'INFO'
    );

    return ApiResponse.success(res, report, 'Report uploaded successfully', 201);
  }),

  getReport: asyncHandler(async (req, res) => {
    const report = await reportService.getReport(req.params.id, req.user.id);
    return ApiResponse.success(res, report, 'Report fetched successfully');
  }),

  getUserReports: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { reports, total } = await reportService.getUserReports(
      req.user.id,
      page,
      limit
    );

    return ApiResponse.paginated(
      res,
      reports,
      total,
      page,
      limit,
      'Reports fetched successfully'
    );
  }),

  deleteReport: asyncHandler(async (req, res) => {
    const result = await reportService.deleteReport(req.params.id, req.user.id);
    return ApiResponse.success(res, result, 'Report deleted successfully');
  }),

  getReportStatistics: asyncHandler(async (req, res) => {
    const stats = await reportService.getReportStatistics(req.user.id);
    return ApiResponse.success(res, stats, 'Report statistics fetched successfully');
  }),

  getRecentReports: asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const limit = parseInt(req.query.limit) || 5;

    const reports = await reportService.getRecentReports(req.user.id, days, limit);
    return ApiResponse.success(res, reports, 'Recent reports fetched successfully');
  }),
};

export default reportController;