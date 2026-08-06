import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

export class ComparisonService {
  async compareReports(userId, oldReportId, newReportId) {
    try {
      const oldReport = await prisma.medicalReport.findUnique({
        where: { id: oldReportId },
        include: { aiAnalysis: { take: 1 } },
      });

      const newReport = await prisma.medicalReport.findUnique({
        where: { id: newReportId },
        include: { aiAnalysis: { take: 1 } },
      });

      if (!oldReport || !newReport || oldReport.user_id !== userId || newReport.user_id !== userId) {
        throw new AppError('Reports not found', 404);
      }

      const oldAnalysis = oldReport.aiAnalysis[0];
      const newAnalysis = newReport.aiAnalysis[0];

      if (!oldAnalysis || !newAnalysis) {
        throw new AppError('Analysis data not available for comparison', 400);
      }

      const comparison = this.generateComparison(oldAnalysis, newAnalysis);

      const reportComparison = await prisma.reportComparison.create({
        data: {
          user_id: userId,
          old_report_id: oldReportId,
          new_report_id: newReportId,
          comparison_summary: comparison.summary,
          health_improvement_score: comparison.improvementScore,
          detected_changes: comparison.changes,
          recurring_diseases: comparison.recurring,
          worsening_conditions: comparison.worsening,
          improvement_areas: comparison.improvements,
        },
      });

      // Update disease history
      await this.updateDiseaseHistory(userId, newAnalysis);

      logger.info(`Reports compared: ${oldReportId} vs ${newReportId}`);

      return reportComparison;
    } catch (error) {
      logger.error('Report comparison error:', error);
      throw error;
    }
  }

  generateComparison(oldAnalysis, newAnalysis) {
    const changes = [];
    const recurring = [];
    const worsening = [];
    const improvements = [];

    // Compare diseases
    if (oldAnalysis.disease_detected !== newAnalysis.disease_detected) {
      changes.push(`Disease changed from ${oldAnalysis.disease_detected} to ${newAnalysis.disease_detected}`);
    } else if (oldAnalysis.disease_detected === newAnalysis.disease_detected) {
      recurring.push(`${newAnalysis.disease_detected} recurring`);
    }

    // Compare severity
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const oldSeverity = severityLevels[oldAnalysis.severity] || 0;
    const newSeverity = severityLevels[newAnalysis.severity] || 0;

    if (newSeverity > oldSeverity) {
      worsening.push(`Severity increased from ${oldAnalysis.severity} to ${newAnalysis.severity}`);
    } else if (newSeverity < oldSeverity) {
      improvements.push(`Severity decreased from ${oldAnalysis.severity} to ${newAnalysis.severity}`);
    }

    // Compare risk scores
    const riskDifference = newAnalysis.risk_score - oldAnalysis.risk_score;
    if (riskDifference > 10) {
      worsening.push(`Risk score increased by ${riskDifference.toFixed(1)}%`);
    } else if (riskDifference < -10) {
      improvements.push(`Risk score decreased by ${Math.abs(riskDifference).toFixed(1)}%`);
    }

    const improvementScore = Math.max(0, 100 - (riskDifference * 2));

    return {
      summary: this.generateSummary(changes, recurring, worsening, improvements),
      improvementScore: Math.round(improvementScore),
      changes: changes.join('; '),
      recurring: recurring.join('; '),
      worsening: worsening.join('; '),
      improvements: improvements.join('; '),
    };
  }

  generateSummary(changes, recurring, worsening, improvements) {
    const parts = [];

    if (improvements.length > 0) {
      parts.push(`Health improvements detected: ${improvements.join(', ')}`);
    }

    if (worsening.length > 0) {
      parts.push(`Areas of concern: ${worsening.join(', ')}`);
    }

    if (recurring.length > 0) {
      parts.push(`Recurring issues: ${recurring.join(', ')}`);
    }

    if (changes.length > 0) {
      parts.push(`Changes noted: ${changes.join(', ')}`);
    }

    return parts.join('. ') || 'Reports show stable health status.';
  }

  async updateDiseaseHistory(userId, analysis) {
    try {
      const disease = await prisma.diseaseHistory.findFirst({
        where: {
          user_id: userId,
          disease_name: analysis.disease_detected,
        },
      });

      if (disease) {
        // Update existing disease record
        await prisma.diseaseHistory.update({
          where: { id: disease.id },
          data: {
            last_detected: new Date(),
            recurrence_count: disease.recurrence_count + 1,
            severity_level: analysis.severity,
            progression_level: this.determineProgression(disease.severity_level, analysis.severity),
          },
        });
      } else if (analysis.disease_detected) {
        // Create new disease record
        await prisma.diseaseHistory.create({
          data: {
            user_id: userId,
            disease_name: analysis.disease_detected,
            first_detected: new Date(),
            last_detected: new Date(),
            severity_level: analysis.severity,
            current_status: 'active',
          },
        });
      }
    } catch (error) {
      logger.error('Disease history update error:', error);
    }
  }

  determineProgression(oldSeverity, newSeverity) {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    const oldLevel = levels[oldSeverity] || 0;
    const newLevel = levels[newSeverity] || 0;

    if (newLevel > oldLevel) return 'worsening';
    if (newLevel < oldLevel) return 'improving';
    return 'stable';
  }

  async getDiseaseHistory(userId) {
    return prisma.diseaseHistory.findMany({
      where: { user_id: userId },
      orderBy: { last_detected: 'desc' },
    });
  }

  async getComparisonHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [comparisons, total] = await Promise.all([
      prisma.reportComparison.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          old_report: { select: { report_name: true } },
          new_report: { select: { report_name: true } },
        },
      }),
      prisma.reportComparison.count({ where: { user_id: userId } }),
    ]);

    return { comparisons, total, page, limit };
  }

  async getHealthTimeline(userId) {
    const reports = await prisma.medicalReport.findMany({
      where: { user_id: userId },
      include: { ai_analyses: { take: 1 } },
      orderBy: { upload_date: 'asc' },
      take: 12,
    });

    return reports.map((report) => ({
      date: report.upload_date,
      reportName: report.report_name,
      type: report.report_type,
      status: report.report_status,
      analysis: report.ai_analyses[0] || null,
    }));
  }
}

export default new ComparisonService();