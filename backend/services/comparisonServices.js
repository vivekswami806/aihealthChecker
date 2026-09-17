import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

const SEVERITY_RANK = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export class ComparisonService {
  async compareReports(userId, oldReportId, newReportId) {
    const oldReport = await prisma.medicalReport.findUnique({
      where: { id: oldReportId },
      include: { aiAnalysis: true },
    });

    const newReport = await prisma.medicalReport.findUnique({
      where: { id: newReportId },
      include: { aiAnalysis: true },
    });

    if (
      !oldReport ||
      !newReport ||
      oldReport.userId !== userId ||
      newReport.userId !== userId
    ) {
      throw new AppError('Reports not found', 404);
    }

    const oldAnalysis = oldReport.aiAnalysis;
    const newAnalysis = newReport.aiAnalysis;

    if (!oldAnalysis || !newAnalysis) {
      throw new AppError('Analysis data not available for comparison', 400);
    }

    const comparison = this.generateComparison(oldAnalysis, newAnalysis);

    const existing = await prisma.reportComparison.findFirst({
      where: { userId, oldReportId, newReportId },
    });

    const reportComparison = existing
      ? await prisma.reportComparison.update({
          where: { id: existing.id },
          data: {
            comparisonSummary: comparison.summary,
            healthImprovementScore: comparison.improvementScore,
            detectedChanges: comparison.detectedChanges,
          },
        })
      : await prisma.reportComparison.create({
          data: {
            userId,
            oldReportId,
            newReportId,
            comparisonSummary: comparison.summary,
            healthImprovementScore: comparison.improvementScore,
            detectedChanges: comparison.detectedChanges,
          },
        });

    await this.updateDiseaseHistory(userId, newAnalysis);

    console.log(`Reports compared: ${oldReportId} vs ${newReportId}`);
    return reportComparison;
  }

  async compareWithPrevious(userId, newReportId) {
    const previous = await prisma.medicalReport.findFirst({
      where: {
        userId,
        id: { not: newReportId },
        reportStatus: 'COMPLETED',
        aiAnalysis: { isNot: null },
      },
      orderBy: { uploadDate: 'desc' },
      include: { aiAnalysis: true },
    });

    if (!previous) {
      const analysis = await prisma.aIAnalysis.findUnique({
        where: { reportId: newReportId },
      });
      if (analysis) {
        await this.updateDiseaseHistory(userId, analysis);
      }
      return null;
    }

    return this.compareReports(userId, previous.id, newReportId);
  }

  generateComparison(oldAnalysis, newAnalysis) {
    const changes = [];
    const recurring = [];
    const worsening = [];
    const improvements = [];

    if (oldAnalysis.diseaseDetected !== newAnalysis.diseaseDetected) {
      changes.push(
        `Condition changed from ${oldAnalysis.diseaseDetected} to ${newAnalysis.diseaseDetected}`
      );
    } else if (newAnalysis.diseaseDetected) {
      recurring.push(`${newAnalysis.diseaseDetected} still present`);
    }

    const oldSeverity = SEVERITY_RANK[oldAnalysis.severity] || 0;
    const newSeverity = SEVERITY_RANK[newAnalysis.severity] || 0;

    if (newSeverity > oldSeverity) {
      worsening.push(
        `Severity increased from ${oldAnalysis.severity} to ${newAnalysis.severity}`
      );
    } else if (newSeverity < oldSeverity) {
      improvements.push(
        `Severity decreased from ${oldAnalysis.severity} to ${newAnalysis.severity}`
      );
    }

    const riskDifference = (newAnalysis.riskScore || 0) - (oldAnalysis.riskScore || 0);
    if (riskDifference > 10) {
      worsening.push(`Risk score increased by ${riskDifference.toFixed(1)}`);
    } else if (riskDifference < -10) {
      improvements.push(
        `Risk score decreased by ${Math.abs(riskDifference).toFixed(1)}`
      );
    }

    const improvementScore = Math.max(
      0,
      Math.min(100, Math.round(100 - riskDifference * 2))
    );

    return {
      summary: this.generateSummary(changes, recurring, worsening, improvements),
      improvementScore,
      detectedChanges: {
        changes,
        recurring,
        worsening,
        improvements,
        oldDisease: oldAnalysis.diseaseDetected,
        newDisease: newAnalysis.diseaseDetected,
        oldSeverity: oldAnalysis.severity,
        newSeverity: newAnalysis.severity,
        oldRiskScore: oldAnalysis.riskScore,
        newRiskScore: newAnalysis.riskScore,
      },
    };
  }

  generateSummary(changes, recurring, worsening, improvements) {
    const parts = [];
    if (improvements.length) parts.push(`Improvements: ${improvements.join(', ')}`);
    if (worsening.length) parts.push(`Concerns: ${worsening.join(', ')}`);
    if (recurring.length) parts.push(`Recurring: ${recurring.join(', ')}`);
    if (changes.length) parts.push(`Changes: ${changes.join(', ')}`);
    return parts.join('. ') || 'Reports show stable health status.';
  }

  async updateDiseaseHistory(userId, analysis) {
    try {
      if (!analysis?.diseaseDetected) return;

      const disease = await prisma.diseaseHistory.findFirst({
        where: {
          userId,
          diseaseName: analysis.diseaseDetected,
        },
      });

      if (disease) {
        await prisma.diseaseHistory.update({
          where: { id: disease.id },
          data: {
            lastDetected: new Date(),
            recurrenceCount: disease.recurrenceCount + 1,
            progressionLevel: this.determineProgression(
              disease.progressionLevel,
              analysis.severity
            ),
            currentStatus: this.mapStatusFromSeverity(analysis.severity),
          },
        });
      } else {
        await prisma.diseaseHistory.create({
          data: {
            userId,
            diseaseName: analysis.diseaseDetected,
            firstDetected: new Date(),
            lastDetected: new Date(),
            currentStatus: 'ACTIVE',
            progressionLevel: String(analysis.severity || 'MEDIUM'),
          },
        });
      }
    } catch (error) {
      logger.error('Disease history update error:', error);
    }
  }

  mapStatusFromSeverity(severity) {
    const rank = SEVERITY_RANK[severity] || 2;
    if (rank >= 3) return 'WORSENING';
    if (rank === 1) return 'IMPROVING';
    return 'ACTIVE';
  }

  determineProgression(oldSeverity, newSeverity) {
    const oldLevel = SEVERITY_RANK[oldSeverity] || 0;
    const newLevel = SEVERITY_RANK[newSeverity] || 0;
    if (newLevel > oldLevel) return 'worsening';
    if (newLevel < oldLevel) return 'improving';
    return 'stable';
  }

  async getDiseaseHistory(userId) {
    return prisma.diseaseHistory.findMany({
      where: { userId },
      orderBy: { lastDetected: 'desc' },
    });
  }

  async getComparisonHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [comparisons, total] = await Promise.all([
      prisma.reportComparison.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          oldReport: { select: { id: true, reportName: true, uploadDate: true } },
          newReport: { select: { id: true, reportName: true, uploadDate: true } },
        },
      }),
      prisma.reportComparison.count({ where: { userId } }),
    ]);

    return { comparisons, total, page, limit };
  }

  async getHealthTimeline(userId) {
    const reports = await prisma.medicalReport.findMany({
      where: { userId },
      include: { aiAnalysis: true },
      orderBy: { uploadDate: 'asc' },
      take: 50,
    });

    return reports.map((report) => ({
      id: report.id,
      date: report.uploadDate,
      reportName: report.reportName,
      type: report.reportType,
      status: report.reportStatus,
      fileUrl: report.fileUrl,
      analysis: report.aiAnalysis
        ? {
            id: report.aiAnalysis.id,
            diseaseDetected: report.aiAnalysis.diseaseDetected,
            severity: report.aiAnalysis.severity,
            riskScore: report.aiAnalysis.riskScore,
            summary: report.aiAnalysis.aiSummary,
          }
        : null,
    }));
  }
}

export default new ComparisonService();
