import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import prisma from '../config/database.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import textExtractionService from './textExtractionService.js';
import ragService from './ragService.js';

const apiKey = config.googleapi.apiKey || config.gemini.apiKey;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SEVERITY_MAP = {
  low: 'LOW',
  LOW: 'LOW',
  medium: 'MEDIUM',
  MEDIUM: 'MEDIUM',
  high: 'HIGH',
  HIGH: 'HIGH',
  critical: 'CRITICAL',
  CRITICAL: 'CRITICAL',
};

function normalizeSeverity(value) {
  if (!value) return 'MEDIUM';
  const key = String(value).trim();
  return SEVERITY_MAP[key] || SEVERITY_MAP[key.toLowerCase()] || 'MEDIUM';
}

function asText(value, fallback = 'N/A') {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

export class AIAnalysisService {
  async extractTextFromFile(fileUrl, reportType = '', fileName = '') {
    try {
      return await textExtractionService.extractFromUrl(fileUrl, reportType, fileName);
    } catch (error) {
      logger.error('Text extraction error', {
        message: error?.message,
        fileUrl,
        fileName,
      });
      throw error;
    }
  }

  async analyzeWithGeminiGoogle(
    reportId,
    userId,
    extractedText,
    fileUrl,
    reportType,
    reportName = 'Medical Report'
  ) {
    if (!genAI) {
      throw new AppError('Gemini API key is not configured', 500);
    }

    try {
      logger.info('Starting RAG-based Gemini analysis', { reportId });

      await prisma.medicalReport.update({
        where: { id: reportId },
        data: { reportStatus: 'PROCESSING' },
      });

      let documentText = extractedText;
      if (!textExtractionService.isUsableText(documentText)) {
        documentText = await this.extractTextFromFile(
          fileUrl,
          reportType,
          reportName
        );
      }

      if (!textExtractionService.isUsableText(documentText)) {
        throw new AppError(
          `Could not extract readable text from this document. ${textExtractionService.getSupportedFormatsMessage()}. For scanned PDFs or photos, ensure the image is clear and well-lit.`,
          422
        );
      }

      await prisma.medicalReport.update({
        where: { id: reportId },
        data: {
          extractedText: String(documentText).substring(0, 12000),
        },
      });

      await ragService.indexReportDocument(reportId, userId, documentText);

      const retrievalQuery = ragService.buildAnalysisQuery(reportName, documentText);
      const retrievedChunks = await ragService.retrieveRelevantChunks(
        userId,
        reportId,
        retrievalQuery
      );

      const ragContext = ragService.buildRagContext(retrievedChunks, reportName);
      const analysisPrompt = this.buildRagAnalysisPrompt(ragContext, documentText);

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const result = await model.generateContent(analysisPrompt);
      const analysisText = result.response.text();
      const analysis = this.parseAIResponse(analysisText);

      if (!analysis) {
        throw new AppError(
          'AI returned an invalid response. Please retry analysis — no medical conclusions were saved.',
          422
        );
      }

      const payload = {
        diseaseDetected: asText(analysis.disease_detected, 'Unknown'),
        severity: normalizeSeverity(analysis.severity),
        riskScore: Number(analysis.risk_score) || 0,
        aiSummary: asText(analysis.summary, 'No summary available'),
        causes: asText(analysis.causes),
        precautions: asText(analysis.precautions),
        dietSuggestions: asText(analysis.diet_suggestions),
        exerciseSuggestions: asText(analysis.exercise_suggestions),
        medicationsWarning: asText(analysis.medications_warning, null),
        doctorRecommendation: asText(analysis.doctor_recommendation, null),
      };

      const aiAnalysis = await prisma.aIAnalysis.upsert({
        where: { reportId },
        update: payload,
        create: {
          reportId,
          ...payload,
        },
      });

      await prisma.medicalReport.update({
        where: { id: reportId },
        data: {
          reportStatus: 'COMPLETED',
        },
      });

      logger.info('RAG analysis completed', {
        reportId,
        chunksUsed: retrievedChunks.length,
      });

      return aiAnalysis;
    } catch (error) {
      logger.error('Gemini RAG analysis error', {
        message: error?.message,
        reportId,
      });

      await prisma.medicalReport.update({
        where: { id: reportId },
        data: { reportStatus: 'FAILED' },
      });

      if (error instanceof AppError) throw error;
      throw new AppError(`AI Analysis failed: ${error.message}`, 500);
    }
  }

  buildRagAnalysisPrompt(ragContext, fullDocumentText) {
    return `You are a medical report analysis assistant.

You must analyze ONLY the extracted document text and retrieved context below.
Do NOT analyze images. Do NOT invent values that are not present in the text.

${ragContext}

Full extracted document text:
${fullDocumentText}

Respond with ONLY valid JSON using these fields:
- disease_detected: string
- severity: one of low, medium, high, critical
- risk_score: number 0-100
- summary: string
- causes: string
- precautions: string
- diet_suggestions: string
- exercise_suggestions: string
- medications_warning: string
- doctor_recommendation: string
- abnormal_values: string

If text is unclear, state that clearly in summary and keep risk_score conservative.

Disclaimer: This is informational only, not a medical diagnosis.`;
  }

  /**
   * Returns parsed JSON or null. Never invents medical conclusions.
   */
  parseAIResponse(responseText) {
    try {
      const jsonMatch = String(responseText || '').match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.error('AI response contained no JSON object');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        (!parsed.summary && !parsed.disease_detected)
      ) {
        logger.error('AI JSON missing required medical fields');
        return null;
      }

      return parsed;
    } catch (error) {
      logger.error('AI response parsing error', { message: error?.message });
      return null;
    }
  }

  async getAnalysisHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      prisma.aIAnalysis.findMany({
        where: { report: { userId } },
        skip,
        take: limit,
        orderBy: { generatedAt: 'desc' },
        include: {
          report: {
            select: {
              id: true,
              reportName: true,
              reportType: true,
              uploadDate: true,
            },
          },
        },
      }),
      prisma.aIAnalysis.count({ where: { report: { userId } } }),
    ]);

    return { analyses, total, page, limit };
  }

  async getAnalysis(analysisId, userId) {
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { id: analysisId },
      include: { report: true },
    });

    if (!analysis || analysis.report.userId !== userId) {
      throw new AppError('Analysis not found', 404);
    }

    return analysis;
  }

  async getAnalysisByReportId(reportId, userId) {
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { reportId },
      include: { report: true },
    });

    if (!analysis || analysis.report.userId !== userId) {
      throw new AppError('Analysis not found', 404);
    }

    return analysis;
  }

  async getAnalysisStatus(reportId, userId) {
    const report = await prisma.medicalReport.findUnique({
      where: { id: reportId },
      include: { aiAnalysis: true },
    });

    if (!report || report.userId !== userId) {
      throw new AppError('Report not found', 404);
    }

    let comparison = null;
    let medicalHistory = [];

    if (report.reportStatus === 'COMPLETED' && report.aiAnalysis) {
      const history = await comparisonServiceSafe(userId);
      medicalHistory = history.medicalHistory;
      comparison = history.comparison;
    }

    return {
      status: report.reportStatus,
      report: {
        id: report.id,
        reportName: report.reportName,
        fileUrl: report.fileUrl,
        uploadDate: report.uploadDate,
        extractedTextPreview: report.extractedText
          ? String(report.extractedText).slice(0, 300)
          : null,
      },
      analysis: report.aiAnalysis,
      comparison,
      medicalHistory,
    };
  }
}

async function comparisonServiceSafe(userId) {
  try {
    const comparisonService = (await import('./comparisonServices.js')).default;
    const medicalHistory = await comparisonService.getDiseaseHistory(userId);
    const latestComparison = await comparisonService.getComparisonHistory(userId, 1, 1);
    return {
      medicalHistory,
      comparison: latestComparison.comparisons[0] || null,
    };
  } catch {
    return { medicalHistory: [], comparison: null };
  }
}

export default new AIAnalysisService();
