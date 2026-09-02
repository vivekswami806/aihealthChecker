import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { paginationValidator } from '../limiting/validators.js';
import notificationController from '../controller/notificationController.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', paginationValidator, notificationController.getNotifications);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark all as read (before /:notificationId routes)
router.put('/read-all', notificationController.markAllAsRead);

// Mark as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
