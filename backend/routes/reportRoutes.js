import { Router } from 'express';
import reportController from '../controller/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware } from '../services/fileUploadServices.js';
import { uploadReportValidator, paginationValidator } from '../limiting/validators.js';

const router = Router();

// All report routes require authentication
router.use(authenticate);

// Upload report
router.post('/upload', uploadMiddleware.single('file'), // uploadReportValidator,
reportController.uploadReport
);

// Get all user reports
router.get('/', paginationValidator, reportController.getUserReports);

// Get report statistics
router.get('/statistics', reportController.getReportStatistics);

// Get recent reports
router.get('/recent', reportController.getRecentReports);

// Get single report
router.get('/:id', reportController.getReport);

// Delete report
router.delete('/:id', reportController.deleteReport);

export default router;