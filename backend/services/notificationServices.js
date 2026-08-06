import nodemailer from 'nodemailer';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

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

  async createInAppNotification(userId, title, message, type = 'info', actionUrl = null) {
    try {
      const notification = await prisma.notification.create({
        data: {
          user_id: userId,
          title,
          message,
          type,
          action_url: actionUrl,
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
      select: { email: true, full_name: true },
    });

    if (!user) return;

    // Create in-app notification
    await this.createInAppNotification(
      userId,
      'Report Analysis Complete',
      `Your medical report "${reportName}" has been analyzed successfully.`,
      'success',
      `/dashboard/analysis/${analysisId}`
    );

    // Send email
    const emailHtml = `
      <h2>Report Analysis Complete</h2>
      <p>Hi ${user.full_name},</p>
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
      select: { email: true, full_name: true },
    });

    if (!user) return;

    // Create in-app notification
    await this.createInAppNotification(
      userId,
      'Health Alert',
      message,
      'alert'
    );

    // Send email
    const emailHtml = `
      <h2>Health Alert</h2>
      <p>Hi ${user.full_name},</p>
      <p><strong>${message}</strong></p>
      <p>Please consult with your healthcare provider for proper guidance.</p>
      <p>Best regards,<br>Medical Report Team</p>
    `;

    await this.sendEmail(user.email, 'Health Alert', emailHtml);
  }

  async notifyRecurringDisease(userId, diseaseName) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, full_name: true },
    });

    if (!user) return;

    const message = `We detected a recurrence of ${diseaseName} in your recent report. Please consult your doctor.`;

    await this.createInAppNotification(
      userId,
      'Disease Recurrence Detected',
      message,
      'warning'
    );

    const emailHtml = `
      <h2>Disease Recurrence Alert</h2>
      <p>Hi ${user.full_name},</p>
      <p>${message}</p>
      <p>Please schedule an appointment with your healthcare provider as soon as possible.</p>
      <p>Best regards,<br>Medical Report Team</p>
    `;

    await this.sendEmail(user.email, 'Disease Recurrence Alert', emailHtml);
  }

  async notifyReportUpload(userId, reportName) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, full_name: true },
    });

    if (!user) return;

    // Create in-app notification
    await this.createInAppNotification(
      userId,
      'Report Uploaded',
      `Your report "${reportName}" has been uploaded and is being processed.`,
      'info',
      '/dashboard/reports'
    );

    // Send email
    const emailHtml = `
      <h2>Report Uploaded Successfully</h2>
      <p>Hi ${user.full_name},</p>
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
      select: { email: true, full_name: true },
    });

    if (!user) return;

    await this.createInAppNotification(
      userId,
      'Subscription Expiring Soon',
      'Your premium subscription will expire in 7 days. Renew now to continue enjoying premium features.',
      'reminder'
    );

    const emailHtml = `
      <h2>Subscription Expiring Soon</h2>
      <p>Hi ${user.full_name},</p>
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
      select: { email: true, full_name: true },
    });

    if (!user) return;

    await this.createInAppNotification(
      userId,
      'Weekly Health Check-in',
      'Time for your weekly health check-in. Upload your recent health metrics.',
      'reminder'
    );

    const emailHtml = `
      <h2>Weekly Health Check-in</h2>
      <p>Hi ${user.full_name},</p>
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
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.notification.count({ where: { user_id: userId } }),
    ]);

    return { notifications, total, page, limit };
  }

  async markAsRead(notificationId, userId) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });
  }

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { is_read: true },
    });
  }

  async deleteNotification(notificationId) {
    return prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
  }
}

export default new NotificationService();