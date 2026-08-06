import reportRepository from '../repositories/reportRepository.js';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import fileUploadService from './fileUploadServices.js';

export class ReportService {
  async uploadReport(userId, file, reportName, reportType) {
    // Validate file
    fileUploadService.validateFile(file);

    // Upload to Cloudinary
    const uploadResult = await fileUploadService.uploadToCloudinary(
      file,
      userId
    );

    // Create report record
    const report = await reportRepository.create({
      userId, // ✅ camelCase
      reportName,
      reportType,
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
      uploadDate: report.uploadDate,
      status: report.reportStatus,
    };
  }

  async extractTextFromPDF(file) {
    try {
      const data = await pdfParse(file.buffer);
      return data.text;
    } catch (error) {
      logger.error('PDF text extraction error:', error);
      throw new AppError('Failed to extract text from PDF', 500);
    }
  }

  async extractTextFromImage(file) {
    try {
      const result = await Tesseract.recognize(file.buffer, 'eng', {
        logger: (m) => logger.debug('OCR progress:', m),
      });
      return result.data.text;
    } catch (error) {
      logger.error('Image OCR error:', error);
      throw new AppError('Failed to extract text from image', 500);
    }
  }

  async processReportText(reportId, userId) {
    const report = await reportRepository.findById(reportId);
    // ✅ Fixed: userId instead of user_id
    if (!report || report.userId !== userId) {
      throw new AppError('Report not found', 404);
    }

    try {
      let extractedText = '';

      if (report.fileUrl.includes('.pdf')) {
        extractedText = 'PDF text extraction to be implemented';
      } else if (report.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
        extractedText = 'Image OCR to be implemented';
      }

      // ✅ Fixed: camelCase field names
      await reportRepository.update(reportId, {
        extractedText,
        reportStatus: 'COMPLETED',
      });

      return extractedText;
    } catch (error) {
      logger.error('Report processing error:', error);
      await reportRepository.update(reportId, {
        reportStatus: 'FAILED',
      });
      throw error;
    }
  }

  async getReport(reportId, userId) {
    const report = await reportRepository.findById(reportId);
    // ✅ Fixed: userId instead of user_id
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
    // ✅ Fixed: userId instead of user_id
    if (!report || report.userId !== userId) {
      throw new AppError('Report not found', 404);
    }

    // Delete from Cloudinary
    if (report.fileUrl) {
      const publicId = report.fileUrl.split('/').pop().split('.')[0];
      await fileUploadService.deleteFromCloudinary(publicId);
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
}

export default new ReportService();