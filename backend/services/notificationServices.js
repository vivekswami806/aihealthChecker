import nodemailer from 'nodemailer';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

const NOTIFICATION_TYPE_MAP = {
  info: 'INFO',
  INFO: 'INFO',
  success: 'INFO',
  SUCCESS: 'INFO',
  warning: 'WARNING',
  WARNING: 'WARNING',
  alert: 'ALERT',
  ALERT: 'ALERT',
  reminder: 'REMINDER',
  REMINDER: 'REMINDER',
};

function normalizeNotificationType(type) {
  return NOTIFICATION_TYPE_MAP[type] || 'INFO';
}

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export class NotificationService {
  async sendEmail(to, subject, html) {
    try {
      await transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to: ${to}`);
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  async createInAppNotification(userId, title, message, type = 'INFO') {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type: normalizeNotificationType(type),
        },
      });
      logger.info(`In-app notification created for user: ${userId}`);
      return notification;
    } catch (error) {
      logger.error('Notification creation error:', error);
      throw error;
    }
  }

  async notifyReportAnalysisComplete(userId, reportName, analysisId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user) return;

    await this.createInAppNotification(
      userId,
      'Report Analysis Complete',
      `Your medical report "${reportName}" has been analyzed successfully.`,
      'INFO'
    );

    const emailHtml = `
      <h2>Report Analysis Complete</h2>
      <p>Hi ${user.fullName},</p>
      <p>Your medical report "<strong>${reportName}</strong>" has been successfully analyzed by our AI system.</p>
      <p>
        <a href="${config.FRONTEND_URL}/dashboard/analysis/${analysisId}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Analysis
        </a>
      </p>
      <p>Best regards,<br>Medical Report Team</p>
    `;

    await this.sendEmail(
      user.email,
      'Your Medical Report Analysis is Ready',
      emailHtml
    );
  }

  async notifyHealthAlert(userId, alertType, message) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user) return;

    await this.createInAppNotification(
      userId,
      'Health Alert',
      message,
      'ALERT'
    );

    const emailHtml = `
      <h2>Health Alert</h2>
      <p>Hi ${user.fullName},</p>
      <p><strong>${message}</strong></p>
      <p>Please consult with your healthcare provider for proper guidance.</p>
      <p>Best regards,<br>Medical Report Team</p>
    `;

    await this.sendEmail(user.email, 'Health Alert', emailHtml);
  }

  async notifyRecurringDisease(userId, diseaseName) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user) return;

    const message = `We detected a recurrence of ${diseaseName} in your recent report. Please consult your doctor.`;

    await this.createInAppNotification(
      userId,
      'Disease Recurrence Detected',
      message,
      'WARNING'
    );

    const emailHtml = `
      <h2>Disease Recurrence Alert</h2>
      <p>Hi ${user.fullName},</p>
      <p>${message}</p>
      <p>Please schedule an appointment with your healthcare provider as soon as possible.</p>
      <p>Best regards,<br>Medical Report Team</p>
    `;

    await this.sendEmail(user.email, 'Disease Recurrence Alert', emailHtml);
  }

  async notifyReportUpload(userId, reportName) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user) return;

    await this.createInAppNotification(
      userId,
      'Report Uploaded',
      `Your report "${reportName}" has been uploaded and is being processed.`,
      'INFO'
    );

    const emailHtml = `
      <h2>Report Uploaded Successfully</h2>
      <p>Hi ${user.fullName},</p>
      <p>Your medical report "<strong>${reportName}</strong>" has been uploaded successfully.</p>
      <p>We will analyze it and notify you once the analysis is complete.</p>
      <p>
        <a href="${config.FRONTEND_URL}/dashboard/reports" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Report
        </a>
      </p>
      <p>Best regards,<br>Medical Report Team</p>
    `;

    await this.sendEmail(user.email, 'Medical Report Uploaded', emailHtml);
  }

  async sendSubscriptionExpiry(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user) return;

    await this.createInAppNotification(
      userId,
      'Subscription Expiring Soon',
      'Your premium subscription will expire in 7 days. Renew now to continue enjoying premium features.',
      'REMINDER'
    );

    const emailHtml = `
      <h2>Subscription Expiring Soon</h2>
      <p>Hi ${user.fullName},</p>
      <p>Your premium subscription will expire in 7 days.</p>
      <p>
        <a href="${config.FRONTEND_URL}/dashboard/subscription" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Renew Subscription
        </a>
      </p>
      <p>Best regards,<br>Medical Report Team</p>
    `;

    await this.sendEmail(user.email, 'Subscription Expiring Soon', emailHtml);
  }

  async sendHealthReminder(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user) return;

    await this.createInAppNotification(
      userId,
      'Weekly Health Check-in',
      'Time for your weekly health check-in. Upload your recent health metrics.',
      'REMINDER'
    );

    const emailHtml = `
      <h2>Weekly Health Check-in</h2>
      <p>Hi ${user.fullName},</p>
      <p>It's time for your weekly health check-in. Please upload your recent health metrics to keep your health profile updated.</p>
      <p>
        <a href="${config.FRONTEND_URL}/dashboard/upload" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Upload Health Data
        </a>
      </p>
      <p>Best regards,<br>Medical Report Team</p>
    `;

    await this.sendEmail(user.email, 'Time for Your Weekly Health Check-in', emailHtml);
  }

  async getNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications, total, page, limit };
  }

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId, userId) {
    return prisma.notification.deleteMany({
      where: {
        id: notificationId,
        ...(userId ? { userId } : {}),
      },
    });
  }

  async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}

export default new NotificationService();
