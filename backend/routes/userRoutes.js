import { Router } from 'express';
import userController from '../controller/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { updateProfileValidator, paginationValidator } from '../limiting/validators.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidator, userController.updateProfile);
router.delete('/account', userController.deleteAccount);

// Dashboard
router.get('/dashboard', userController.getDashboard);

// Activity
router.get('/activity', paginationValidator, userController.getActivity);

// Analytics
router.get('/analytics', userController.getUserAnalytics);
router.put('/change-password', userController.changePassword);
router.patch('/2fa', userController.setTwoFactor);

// Admin routes
router.get('/admin/users', authorize('admin'), paginationValidator, userController.getAllUsers);

export default router;