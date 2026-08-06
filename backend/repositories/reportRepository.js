import prisma from '../config/database.js';

export class ReportRepository {
  async create(reportData) {
    return await prisma.medicalReport.create({
      data: {
        userId: reportData.userId,
        reportName: reportData.reportName,
        reportType: reportData.reportType,
        fileUrl: reportData.fileUrl,
        fileSize: reportData.fileSize,
        mimeType: reportData.mimeType,
        reportStatus: reportData.reportStatus || 'PENDING',
      },
    });
  }

  async findById(id) {
    console.log("--- Finding report by ID:", id);
    return await prisma.medicalReport.findUnique({ // ✅ AWAIT HERE
      where: { id },
      include: {
        aiAnalysis: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findByUserId(userId, skip = 0, take = 10) {
    const [reports, total] = await Promise.all([
      prisma.medicalReport.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { uploadDate: 'desc' },
        include: { aiAnalysis: true },
      }),
      prisma.medicalReport.count({ where: { userId } }),
    ]);

    return { reports, total };
  }

  async update(id, updateData) {
    const formattedData = {
      reportName: updateData.reportName || updateData.report_name,
      reportType: updateData.reportType || updateData.report_type,
      reportStatus: updateData.reportStatus || updateData.report_status,
      extractedText: updateData.extractedText || updateData.extracted_text,
    };

    Object.keys(formattedData).forEach(
      (key) => formattedData[key] === undefined && delete formattedData[key]
    );

    return await prisma.medicalReport.update({ // ✅ AWAIT HERE
      where: { id },
      data: formattedData,
    });
  }

  async delete(id) {
    return await prisma.medicalReport.delete({ // ✅ AWAIT HERE
      where: { id },
    });
  }

  async getReportsByStatus(userId, status, skip = 0, take = 10) {
    const statusEnum = status.toUpperCase();

    const [reports, total] = await Promise.all([
      prisma.medicalReport.findMany({
        where: {
          userId,
          reportStatus: statusEnum,
        },
        skip,
        take,
        orderBy: { uploadDate: 'desc' },
      }),
      prisma.medicalReport.count({
        where: {
          userId,
          reportStatus: statusEnum,
        },
      }),
    ]);

    return { reports, total };
  }

  async getRecentReports(userId, days = 30, limit = 5) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.medicalReport.findMany({ // ✅ AWAIT HERE
      where: {
        userId,
        uploadDate: { gte: startDate },
      },
      take: limit,
      orderBy: { uploadDate: 'desc' },
      include: { aiAnalysis: true },
    });
  }

  async getAllReports(skip = 0, take = 10) {
    const [reports, total] = await Promise.all([
      prisma.medicalReport.findMany({
        skip,
        take,
        orderBy: { uploadDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          aiAnalysis: true,
        },
      }),
      prisma.medicalReport.count(),
    ]);

    return { reports, total };
  }

  async getReportStatistics(userId) {
    const [totalReports, pendingReports, processingReports, completedReports, failedReports] =
      await Promise.all([
        prisma.medicalReport.count({ where: { userId } }),
        prisma.medicalReport.count({
          where: {
            userId,
            reportStatus: 'PENDING',
          },
        }),
        prisma.medicalReport.count({
          where: {
            userId,
            reportStatus: 'PROCESSING',
          },
        }),
        prisma.medicalReport.count({
          where: {
            userId,
            reportStatus: 'COMPLETED',
          },
        }),
        prisma.medicalReport.count({
          where: {
            userId,
            reportStatus: 'FAILED',
          },
        }),
      ]);

    return {
      totalReports,
      pendingReports,
      processingReports,
      completedReports,
      failedReports,
    };
  }
}

export default new ReportRepository();