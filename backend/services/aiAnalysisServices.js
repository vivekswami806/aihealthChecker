import axios from 'axios';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import prisma from '../config/database.js';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

// ✅ Use the official SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the SDK
const genAI = new GoogleGenerativeAI(config.googleapi.apiKey);
// const genAI = new GoogleGenerativeAI("");

export class AIAnalysisService {

  // ✅ NEW: Download and extract text from file
  async extractTextFromFile(fileUrl, reportType) {
    try {
      logger.info('Extracting text from file:', { fileUrl, reportType });

      if (reportType === 'application/pdf') {
        // ✅ Extract from PDF
        const response = await axios.get(fileUrl, {
          responseType: 'arraybuffer',
          timeout: 30000
        });
        const data = await pdfParse(response.data);
        return data.text || 'No text found in PDF';

      } else if (reportType.includes('image')) {
        // ✅ Extract from Image using OCR
        const response = await axios.get(fileUrl, {
          responseType: 'arraybuffer',
          timeout: 30000
        });

        logger.info('Starting OCR for image...');
        const result = await Tesseract.recognize(response.data, 'eng', {
          logger: (m) => logger.debug('OCR progress:', m),
        });

        return result.data.text || 'No text found in image';

      } else if (reportType.includes('document') || reportType.includes('word')) {
        // ✅ For documents, return placeholder
        return 'Document uploaded. Please ensure it contains readable text.';
      }

      return 'Unable to extract text from file type: ' + reportType;

    } catch (error) {
      logger.error('Text extraction error', {
        message: error?.message,
        fileUrl,
      });
      return 'Unable to extract text. Analysis will proceed with basic information.';
    }
  }

  // async analyzeReport(reportId, userId, extractedText, fileUrl, reportType) {
  //   try {
  //     // ✅ If no extracted text, try to extract from file
  //     let textToAnalyze = extractedText;

  //     if (!textToAnalyze || textToAnalyze.includes('Medical Report:')) {
  //       logger.info('No extracted text found, attempting to extract from file...');
  //       textToAnalyze = await this.extractTextFromFile(fileUrl, reportType);
  //     }
  //     const analysisPrompt = this.buildAnalysisPrompt(textToAnalyze);
  //     const response = await axios.post(
  //       'https://api.openai.com/v1/chat/completions',
  //       {
  //         model: 'gpt-4-turbo',
  //         messages: [
  //           {
  //             role: 'system',
  //             content: `You are a medical analysis assistant. Analyze medical reports and provide structured insights. 
  //             Return response in JSON format with fields: disease_detected, severity, risk_score (0-100), summary, causes, precautions, diet_suggestions, exercise_suggestions, medications_warning, doctor_recommendation, abnormal_values.`,
  //           },
  //           {
  //             role: 'user',
  //             content: analysisPrompt,
  //           },
  //         ],
  //         temperature: 0.7,
  //         max_tokens: 2000,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${config.openai.apiKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //         timeout: 30000,
  //       }
  //     );

  //     const analysisText = response.data.choices[0].message.content;
  //     const analysis = this.parseAIResponse(analysisText);

  //     // ✅ Save analysis AND extracted text to database
  //     const aiAnalysis = await prisma.aiAnalysis.create({
  //       data: {
  //         reportId,
  //         userId,
  //         diseaseDetected: analysis.disease_detected,
  //         severity: analysis.severity,
  //         riskScore: analysis.risk_score || 0,
  //         aiSummary: analysis.summary,
  //         causes: analysis.causes,
  //         precautions: analysis.precautions,
  //         dietSuggestions: analysis.diet_suggestions,
  //         exerciseSuggestions: analysis.exercise_suggestions,
  //         medicationsWarning: analysis.medications_warning,
  //         doctorRecommendation: analysis.doctor_recommendation,
  //       },
  //     });

  //     // ✅ Update report with extracted text and completed status
  //     await prisma.medicalReport.update({
  //       where: { id: reportId },
  //       data: {
  //         extractedText: textToAnalyze.substring(0, 1000), // Store first 1000 chars
  //         reportStatus: 'COMPLETED',
  //       },
  //     });

  //     logger.info(`AI analysis completed for report: ${reportId}`);
  //     return aiAnalysis;

  //   } catch (error) {
  //     logger.error('AI analysis error', {
  //       message: error?.message,
  //       status: error?.response?.status,
  //       reportId,
  //     });
  //     throw new AppError('Failed to analyze report', 500);
  //   }
  // }

  // async analyzeWithGemini(reportId, userId, extractedText, fileUrl, reportType) {
  //   try {
  //     console.log("---config.gemini.apiKey|", config.gemini.apiKey);
  //     console.log("---config.google.apiKey|", config.googleapi.apiKey);
  //     // if (!config.gemini.apiKey) {
  //     //   logger.warn('Gemini API key not configured, falling back to OpenAI');
  //     //   return this.analyzeReport(reportId, userId, extractedText, fileUrl, reportType);
  //     // }

  //     // ✅ If no extracted text, try to extract from file
  //     let textToAnalyze = extractedText;

  //     if (!textToAnalyze || textToAnalyze.includes('Medical Report:')) {
  //       logger.info('No extracted text found, attempting to extract from file...');
  //       textToAnalyze = await this.extractTextFromFile(fileUrl, reportType);
  //     }

  //     const analysisPrompt = this.buildAnalysisPrompt(textToAnalyze);

  //     const response = await axios.post(
  //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${config.googleapi.apiKey}`,
  //       {
  //         contents: [
  //           {
  //             parts: [
  //               {
  //                 text: analysisPrompt,
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //       {
  //         timeout: 30000,
  //       }
  //     );

  //     const analysisText = response.data.candidates[0].content.parts[0].text;
  //     const analysis = this.parseAIResponse(analysisText);

  //     // ✅ Save analysis AND extracted text to database
  //     const aiAnalysis = await prisma.aiAnalysis.create({
  //       data: {
  //         reportId,
  //         userId,
  //         diseaseDetected: analysis.disease_detected,
  //         severity: analysis.severity,
  //         riskScore: analysis.risk_score || 0,
  //         aiSummary: analysis.summary,
  //         causes: analysis.causes,
  //         precautions: analysis.precautions,
  //         dietSuggestions: analysis.diet_suggestions,
  //         exerciseSuggestions: analysis.exercise_suggestions,
  //         medicationsWarning: analysis.medications_warning,
  //         doctorRecommendation: analysis.doctor_recommendation,
  //       },
  //     });

  //     // ✅ Update report with extracted text and completed status
  //     await prisma.medicalReport.update({
  //       where: { id: reportId },
  //       data: {
  //         extractedText: textToAnalyze.substring(0, 1000),
  //         reportStatus: 'COMPLETED',
  //       },
  //     });

  //     logger.info(`AI analysis completed with Gemini for report: ${reportId}`);
  //     return aiAnalysis;

  //   } catch (error) {
  //     logger.error('Gemini analysis error', {
  //       message: error?.message,
  //       status: error?.response?.status,
  //       reportId,
  //     });
  //     logger.info('Falling back to OpenAI...');
  //     // return this.analyzeReport(reportId, userId, extractedText, fileUrl, reportType);
  //   }
  // }

  async analyzeWithGeminiGoogle(reportId, userId, extractedText, fileUrl, reportType) {
    try {
      logger.info(`Starting Gemini analysis for report: ${reportId}`);

      let textToAnalyze = extractedText;
      if (!textToAnalyze || textToAnalyze.includes("Medical Report:")) {
        textToAnalyze = await this.extractTextFromFile(fileUrl, reportType);
      }

      const analysisPrompt = this.buildAnalysisPrompt(textToAnalyze);

      // ✅ 1. Get the model
      // Use gemini-1.5-flash for speed/cost or gemini-1.5-pro for complex reasoning
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
        // Force JSON output if the model supports it
        generationConfig: { responseMimeType: "application/json" } 
      });

      // ✅ 2. Generate content
      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const analysisText = response.text();

      // ✅ 3. Parse JSON safely
      const analysis = this.parseAIResponse(analysisText);

      // ✅ 4. Save to Database
      const aiAnalysis = await prisma.aiAnalysis.create({
        data: {
          reportId,
          userId,
          diseaseDetected: analysis.disease_detected || "N/A",
          severity: analysis.severity || "Low",
          riskScore: parseInt(analysis.risk_score) || 0,
          aiSummary: analysis.summary,
          causes: analysis.causes,
          precautions: analysis.precautions,
          dietSuggestions: analysis.diet_suggestions,
          exerciseSuggestions: analysis.exercise_suggestions,
          medicationsWarning: analysis.medications_warning,
          doctorRecommendation: analysis.doctor_recommendation,
        },
      });

      // ✅ 5. Update Report Status
      await prisma.medicalReport.update({
        where: { id: reportId },
        data: {
          extractedText: textToAnalyze.substring(0, 3000), // Increased limit
          reportStatus: "COMPLETED",
        },
      });

      return aiAnalysis;

    } catch (error) {
      logger.error("Gemini analysis error", {
        message: error?.message,
        reportId,
      });

      // Update status to failed so the UI knows
      await prisma.medicalReport.update({
        where: { id: reportId },
        data: { reportStatus: "FAILED" },
      });

      throw new AppError(`AI Analysis failed: ${error.message}`, 500);
    }
  }

  buildAnalysisPrompt(extractedText) {
    return `Analyze the following medical report text and provide detailed health insights:

${extractedText || 'Medical Report - Unable to extract text. Provide general analysis based on medical best practices.'}

Please provide analysis in JSON format with the following fields:
- disease_detected: string (detected disease or condition)
- severity: string (low/medium/high/critical)
- risk_score: number (0-100)
- summary: string (brief summary of findings)
- causes: string (potential causes)
- precautions: string (preventive measures)
- diet_suggestions: string (dietary recommendations)
- exercise_suggestions: string (exercise recommendations)
- medications_warning: string (medication warnings if any)
- doctor_recommendation: string (recommended specialist/action)
- abnormal_values: string (list of abnormal values)`;
  }

  parseAIResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        disease_detected: 'Analysis completed',
        severity: 'medium',
        risk_score: 50,
        summary: responseText,
        causes: 'See summary',
        precautions: 'Consult doctor',
        diet_suggestions: 'Balanced diet',
        exercise_suggestions: 'Regular exercise',
        medications_warning: 'Consult pharmacist',
        doctor_recommendation: 'Consult general practitioner',
        abnormal_values: 'See report',
      };
    } catch (error) {
      logger.error('AI response parsing error', {
        message: error?.message,
      });
      return {
        disease_detected: 'Unknown',
        severity: 'medium',
        risk_score: 0,
        summary: responseText,
        causes: '',
        precautions: '',
        diet_suggestions: '',
        exercise_suggestions: '',
        medications_warning: '',
        doctor_recommendation: 'Consult doctor',
        abnormal_values: '',
      };
    }
  }

  async getAnalysisHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      prisma.aiAnalysis.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { generatedAt: 'desc' },
        include: {
          report: {
            select: {
              reportName: true,
              reportType: true,
            }
          }
        },
      }),
      prisma.aiAnalysis.count({ where: { userId } }),
    ]);

    return { analyses, total, page, limit };
  }

  async getAnalysis(analysisId, userId) {
    const analysis = await prisma.aiAnalysis.findUnique({
      where: { id: analysisId },
      include: { report: true },
    });

    if (!analysis || analysis.userId !== userId) {
      throw new AppError('Analysis not found', 404);
    }

    return analysis;
  }
}

export default new AIAnalysisService();