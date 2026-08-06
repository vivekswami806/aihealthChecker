import { Router } from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { paginationValidator } from '../middleware/validators.js';
import auth from "../middleware/auth.js";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', paginationValidator, notificationController.getNotifications);

// Get unread count
router.get('/unread/count',auth, notificationController.getUnreadCount);

// Mark as read
router.put('/:id/read',auth, notificationController.markAsRead);

// Mark all as read
router.put('/read-all', auth, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', auth, notificationController.deleteNotification);

export default router;