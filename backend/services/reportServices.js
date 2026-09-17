import reportRepository from '../repositories/reportRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import fileUploadService from './fileUploadServices.js';
import textExtractionService from './textExtractionService.js';

export class ReportService {
  async uploadReport(userId, file, reportName, reportType) {
    fileUploadService.validateFile(file);

    let extractedText = null;
    try {
      extractedText = await textExtractionService.extractFromBuffer(
        file.buffer,
        reportType || file.mimetype,
        reportName || file.originalname
      );

      if (!textExtractionService.isUsableText(extractedText)) {
        extractedText = null;
        logger.warn('Upload-time text extraction produced limited text', {
          reportName,
          mimeType: file.mimetype,
        });
      }
    } catch (error) {
      logger.warn('Upload-time text extraction failed, will retry during analysis', {
        reportName,
        message: error.message,
      });
    }

    const uploadResult = await fileUploadService.uploadToCloudinary(file, userId);
    const report = await reportRepository.create({
      userId,
      reportName,
      reportType: reportType || file.mimetype,
      fileUrl: uploadResult.secure_url,
      fileSize: uploadResult.bytes,
      mimeType: file.mimetype,
      extractedText: extractedText
        ? String(extractedText).substring(0, 12000)
        : null,
      reportStatus: 'PENDING',
    });

    console.log(`Report uploaded: ${report.id} for user: ${userId}`);

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
    console.log(`Report deleted: ${reportId}`);
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
