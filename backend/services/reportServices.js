import reportRepository from '../repositories/reportRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import fileUploadService from './fileUploadServices.js';

export class ReportService {
  async uploadReport(userId, file, reportName, reportType) {
    fileUploadService.validateFile(file);

    const uploadResult = await fileUploadService.uploadToCloudinary(
      file,
      userId
    );

    const report = await reportRepository.create({
      userId,
      reportName,
      reportType: reportType || file.mimetype,
      fileUrl: uploadResult.secure_url,
      fileSize: uploadResult.bytes,
      mimeType: file.mimetype,
      reportStatus: 'PENDING',
    });

    logger.info(`Report uploaded: ${report.id} for user: ${userId}`);

    return {
      id: report.id,
      reportName: report.reportName,
      reportType: report.reportType,
      fileUrl: report.fileUrl,
      uploadDate: report.uploadDate,
      status: report.reportStatus,
      cloudinaryPublicId: uploadResult.public_id,
    };
  }

  async getReport(reportId, userId) {
    const report = await reportRepository.findById(reportId);
    if (!report || report.userId !== userId) {
      throw new AppError('Report not found', 404);
    }
    return report;
  }

  async getUserReports(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return reportRepository.findByUserId(userId, skip, limit);
  }

  async deleteReport(reportId, userId) {
    const report = await reportRepository.findById(reportId);
    if (!report || report.userId !== userId) {
      throw new AppError('Report not found', 404);
    }

    if (report.fileUrl) {
      try {
        await fileUploadService.deleteFromCloudinary(report.fileUrl);
      } catch (error) {
        logger.warn('Cloudinary delete failed, continuing DB delete', {
          message: error.message,
        });
      }
    }

    await reportRepository.delete(reportId);
    logger.info(`Report deleted: ${reportId}`);
    return { message: 'Report deleted successfully' };
  }

  async getReportStatistics(userId) {
    return reportRepository.getReportStatistics(userId);
  }

  async getRecentReports(userId, days = 30, limit = 5) {
    return reportRepository.getRecentReports(userId, days, limit);
  }

  async getPreviousReport(userId, currentReportId) {
    return reportRepository.findPreviousWithAnalysis(userId, currentReportId);
  }
}

export default new ReportService();
