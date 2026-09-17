import Bull from 'bull';
import { config } from '../config/index.js';
import logger from '../config/logger.js';
import prisma from '../config/database.js';
import aiAnalysisService from '../services/aiAnalysisServices.js';
import comparisonService from '../services/comparisonServices.js';
import notificationService from '../services/notificationServices.js';

let analysisQueue = null;
let redisAvailable = false;

function createQueue() {
  try {
    const redisUrl = config.redis?.url || 'redis://127.0.0.1:6379';
    const queue = new Bull('medical-report-analysis', redisUrl, {
      redis: {
        password: config.redis?.password || undefined,
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
      },
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 30,
      },
    });

    queue.on('error', (err) => {
      logger.warn('Analysis queue Redis error', { message: err.message });
      redisAvailable = false;
    });

    queue.on('ready', () => {
      redisAvailable = true;
      logger.info('Analysis queue connected to Redis');
    });

    queue.process(2, async (job) => {
      const { reportId, userId } = job.data;
      logger.info('Processing analysis job', { reportId, jobId: job.id });

      const report = await prisma.medicalReport.findUnique({
        where: { id: reportId },
      });

      if (!report || report.userId !== userId) {
        throw new Error('Report not found for analysis job');
      }

      const analysis = await aiAnalysisService.analyzeWithGeminiGoogle(
        reportId,
        userId,
        report.extractedText,
        report.fileUrl,
        report.reportType || report.mimeType,
        report.reportName
      );

      const comparison = await comparisonService.compareWithPrevious(userId, reportId);

      // Persist health score from AI risk (dynamic, not dummy)
      const riskScore = Number(analysis.riskScore) || 50;
      await prisma.healthScore.create({
        data: {
          userId,
          score: Math.max(0, Math.min(100, Math.round(100 - riskScore * 0.6))),
        },
      });

      await notificationService.createInAppNotification(
        userId,
        'Report Analysis Complete',
        `Your medical report "${report.reportName}" has been analyzed successfully.`,
        'INFO'
      );

      if (comparison?.detectedChanges?.worsening?.length) {
        await notificationService.createInAppNotification(
          userId,
          'Health Trend Alert',
          comparison.comparisonSummary,
          'WARNING'
        );
      }

      return { reportId, analysisId: analysis.id };
    });

    queue.on('failed', (job, err) => {
      logger.error('Analysis job failed', {
        reportId: job?.data?.reportId,
        message: err.message,
      });
    });

    analysisQueue = queue;
    return queue;
  } catch (error) {
    logger.warn('Could not create analysis queue', { message: error.message });
    return null;
  }
}

export function initAnalysisQueue() {
  if (!analysisQueue) {
    createQueue();
  }
  return analysisQueue;
}

export function isQueueReady() {
  return Boolean(analysisQueue) && redisAvailable;
}

/**
 * Enqueue analysis. Falls back to inline processing if Redis is unavailable.
 */
export async function enqueueAnalysis(reportId, userId) {
  const queue = initAnalysisQueue();

  // Mark processing early so UI can poll
  await prisma.medicalReport.update({
    where: { id: reportId },
    data: { reportStatus: 'PROCESSING' },
  });

  if (queue) {
    try {
      const job = await queue.add(
        { reportId, userId },
        { jobId: `analyze-${reportId}` }
      );
      redisAvailable = true;
      return { queued: true, jobId: job.id, status: 'PROCESSING' };
    } catch (error) {
      logger.warn('Queue add failed — running analysis inline', {
        message: error.message,
      });
    }
  }

  // Inline fallback (no Redis)
  const report = await prisma.medicalReport.findUnique({ where: { id: reportId } });
  const analysis = await aiAnalysisService.analyzeWithGeminiGoogle(
    reportId,
    userId,
    report.extractedText,
    report.fileUrl,
    report.reportType || report.mimeType,
    report.reportName
  );

  const comparison = await comparisonService.compareWithPrevious(userId, reportId);

  await prisma.healthScore.create({
    data: {
      userId,
      score: Math.max(
        0,
        Math.min(100, Math.round(100 - (Number(analysis.riskScore) || 50) * 0.6))
      ),
    },
  });

  await notificationService.createInAppNotification(
    userId,
    'Report Analysis Complete',
    `Your medical report "${report.reportName}" has been analyzed successfully.`,
    'INFO'
  );

  if (comparison?.detectedChanges?.worsening?.length) {
    await notificationService.createInAppNotification(
      userId,
      'Health Trend Alert',
      comparison.comparisonSummary,
      'WARNING'
    );
  }

  return {
    queued: false,
    status: 'COMPLETED',
    analysis,
    comparison,
  };
}

export default { initAnalysisQueue, enqueueAnalysis, isQueueReady };
