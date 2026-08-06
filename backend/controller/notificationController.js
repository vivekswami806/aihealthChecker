import notificationService from "../services/notificationService.js";
import { AppError } from "../middleware/errorHandler.js";
import logger from "../config/logger.js";

export class NotificationController {
  
    // 📥 Get notifications
    async getNotifications(req, res, next) {
      try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
  
        const result = await notificationService.getNotifications(
          userId,
          Number(page),
          Number(limit)
        );
  
        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    }
  
    // 🔔 Unread count
    async getUnreadCount(req, res, next) {
      try {
        const userId = req.user.id;
  
        const count = await notificationService.getUnreadCount(userId);
  
        res.status(200).json({
          success: true,
          unreadCount: count,
        });
      } catch (error) {
        next(error);
      }
    }
  
    // ✅ Mark single as read
    async markAsRead(req, res, next) {
      try {
        const userId = req.user.id;
        const { notificationId } = req.params;
  
        if (!notificationId) {
          throw new AppError("Notification ID required", 400);
        }
  
        const updated = await notificationService.markAsRead(
          notificationId,
          userId
        );
  
        res.status(200).json({
          success: true,
          message: "Notification marked as read",
          data: updated,
        });
      } catch (error) {
        next(error);
      }
    }
  
    // ✅ Mark all as read
    async markAllAsRead(req, res, next) {
      try {
        const userId = req.user.id;
  
        const result = await notificationService.markAllAsRead(userId);
  
        res.status(200).json({
          success: true,
          message: "All notifications marked as read",
          data: result,
        });
      } catch (error) {
        next(error);
      }
    }
  
    // 🗑 Delete notification
    async deleteNotification(req, res, next) {
      try {
        const { notificationId } = req.params;
  
        if (!notificationId) {
          throw new AppError("Notification ID required", 400);
        }
  
        await notificationService.deleteNotification(notificationId);
  
        res.status(200).json({
          success: true,
          message: "Notification deleted",
        });
      } catch (error) {
        next(error);
      }
    }
  
    // 📤 Manual trigger test (optional admin/debug)
    async sendTestNotification(req, res, next) {
      try {
        const userId = req.user.id;
  
        const notification =
          await notificationService.createInAppNotification(
            userId,
            "Test Notification",
            "This is a test notification",
            "info"
          );
  
        res.status(201).json({
          success: true,
          data: notification,
        });
      } catch (error) {
        next(error);
      }
    }
  }
  
  export default new NotificationController();