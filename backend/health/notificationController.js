import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import notificationService from '../services/notificationService.js';

export const notificationController = {
  getNotifications: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { notifications, total } = await notificationService.getNotifications(
      req.user.id,
      page,
      limit
    );

    return ApiResponse.paginated(
      res,
      notifications,
      total,
      page,
      limit,
      'Notifications fetched successfully'
    );
  }),

  markAsRead: asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );

    return ApiResponse.success(res, notification, 'Notification marked as read');
  }),

  markAllAsRead: asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);
    return ApiResponse.success(res, null, 'All notifications marked as read');
  }),

  deleteNotification: asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(req.params.id);
    return ApiResponse.success(res, null, 'Notification deleted successfully');
  }),

  getUnreadCount: asyncHandler(async (req, res) => {
    const count = await prisma.notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    return ApiResponse.success(res, { unread_count: count }, 'Unread count fetched');
  }),
};

export default notificationController;