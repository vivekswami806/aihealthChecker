import { Router } from 'express';
import comparisonController from '../controllers/comparisonController.js';
import { authenticate } from '../middleware/auth.js';
import { createHealthScoreValidator, paginationValidator } from '../middleware/validators.js';

const router = Router();

// All health routes require authentication
router.use(authenticate);

// Report comparison
router.post('/compare', comparisonController.compareReports);
router.get('/history', paginationValidator, comparisonController.getComparisonHistory);

// Disease history
router.get('/diseases', comparisonController.getDiseaseHistory);

// Health timeline
router.get('/timeline', comparisonController.getHealthTimeline);

// Health scores
router.post('/score', createHealthScoreValidator, comparisonController.createHealthScore);
router.get('/scores', paginationValidator, comparisonController.getHealthScores);
router.get('/score/latest', comparisonController.getLatestHealthScore);

export default router;