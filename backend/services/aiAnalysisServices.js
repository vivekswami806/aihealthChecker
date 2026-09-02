import axios from 'axios';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import prisma from '../config/database.js';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  async extractTextFromFile(fileUrl, reportType = '') {
    try {
      logger.info('Extracting text from file', { fileUrl, reportType });
      const type = (reportType || '').toLowerCase();

      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
      });

      if (type.includes('pdf') || fileUrl.toLowerCase().includes('.pdf')) {
        const data = await pdfParse(Buffer.from(response.data));
        return data.text || 'No text found in PDF';
      }

      if (
        type.includes('image') ||
        /\.(jpg|jpeg|png|webp)(\?|$)/i.test(fileUrl)
      ) {
        const result = await Tesseract.recognize(
          Buffer.from(response.data),
          'eng',
          {
            logger: (m) => logger.debug('OCR progress:', m),
          }
        );
        return result.data.text || 'No text found in image';
      }

      return 'Unable to extract text from this file type. Providing general guidance.';
    } catch (error) {
      logger.error('Text extraction error', { message: error?.message, fileUrl });
      return 'Unable to extract text. Analysis will proceed with limited information.';
    }
  }

  async analyzeWithGeminiGoogle(reportId, userId, extractedText, fileUrl, reportType) {
    if (!genAI) {
      throw new AppError('Gemini API key is not configured', 500);
    }

    try {
      logger.info(`Starting Gemini analysis for report: ${reportId}`);

      await prisma.medicalReport.update({
        where: { id: reportId },
        data: { reportStatus: 'PROCESSING' },
      });

      let textToAnalyze = extractedText;
      if (!textToAnalyze || textToAnalyze.includes('Medical Report:')) {
        textToAnalyze = await this.extractTextFromFile(fileUrl, reportType);
      }

      const analysisPrompt = this.buildAnalysisPrompt(textToAnalyze);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const result = await model.generateContent(analysisPrompt);
      const analysisText = result.response.text();
      const analysis = this.parseAIResponse(analysisText);

      const existing = await prisma.aIAnalysis.findUnique({
          where: { id: reportId },
      });

      // const payload = {
      //   diseaseDetected: asText(analysis.disease_detected, 'Unknown'),
      //   severity: normalizeSeverity(analysis.severity),
      //   riskScore: Number(analysis.risk_score) || 0,
      //   aiSummary: asText(analysis.summary, 'No summary available'),
      //   causes: asText(analysis.causes),
      //   precautions: asText(analysis.precautions),
      //   dietSuggestions: asText(analysis.diet_suggestions),
      //   exerciseSuggestions: asText(analysis.exercise_suggestions),
      //   medicationsWarning: asText(analysis.medications_warning, null),
      //   doctorRecommendation: asText(analysis.doctor_recommendation, null),
      // };

      // const aiAnalysis = existing
      //   ? await prisma.aIAnalysis.update({
      //       where: { reportId },
      //       data: payload,
      //     })
      //   : await prisma.aIAnalysis.create({
      //       data: {
      //         reportId,
      //         ...payload,
      //       },
      //     });

      const payload = {
        diseaseDetected: asText(
          analysis.disease_detected,
          'Unknown'
        ),
        severity: normalizeSeverity(analysis.severity),
        riskScore: Number(analysis.risk_score) || 0,
        aiSummary: asText(
          analysis.summary,
          'No summary available'
        ),
        causes: asText(analysis.causes),
        precautions: asText(analysis.precautions),
        dietSuggestions: asText(analysis.diet_suggestions),
        exerciseSuggestions: asText(
          analysis.exercise_suggestions
        ),
        medicationsWarning: asText(
          analysis.medications_warning,
          null
        ),
        doctorRecommendation: asText(
          analysis.doctor_recommendation,
          null
        ),
      };
      
      const aiAnalysis = await prisma.aIAnalysis.upsert({
        where: {
          reportId,
        },
        update: payload,
        create: {
          reportId,
          ...payload,
        },
      }); 

      await prisma.medicalReport.update({
        where: { id: reportId },
        data: {
          extractedText: String(textToAnalyze).substring(0, 8000),
          reportStatus: 'COMPLETED',
        },
      });

      return aiAnalysis;
    } catch (error) {
      logger.error('Gemini analysis error', {
        message: error?.message,
        reportId,
      });


    

      await prisma.medicalReport.update({
        where: { id: reportId },
        data: { reportStatus: 'FAILED' },
      });

      throw new AppError(`AI Analysis failed: ${error.message}`, 500);
    }
  }

  buildAnalysisPrompt(extractedText) {
    return `You are a medical report analysis assistant. Analyze the following medical report text and respond with ONLY valid JSON.

${extractedText || 'Medical Report - Unable to extract text. Provide cautious general analysis.'}

JSON fields required:
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

Disclaimer: This is informational only, not a medical diagnosis.`;
  }

  parseAIResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('AI response parsing error', { message: error?.message });
    }

    return {
      disease_detected: 'Analysis completed',
      severity: 'medium',
      risk_score: 50,
      summary: responseText,
      causes: 'See summary',
      precautions: 'Consult a doctor',
      diet_suggestions: 'Balanced diet',
      exercise_suggestions: 'Regular exercise as advised by a clinician',
      medications_warning: 'Consult your pharmacist or doctor',
      doctor_recommendation: 'Consult a general practitioner',
      abnormal_values: 'See report',
    };
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
      where: { id: reportId },
      include: { report: true },
    });

    if (!analysis || analysis.report.userId !== userId) {
      throw new AppError('Analysis not found', 404);
    }

    return analysis;
  }
}

export default new AIAnalysisService();
