import { Router } from 'express';
import comparisonController from '../controller/comparisonController.js';
import { authenticate } from '../middleware/auth.js';
import { paginationValidator } from '../limiting/validators.js';

const router = Router();

router.use(authenticate);

router.post('/compare', comparisonController.compareReports);
router.get('/history', paginationValidator, comparisonController.getComparisonHistory);
router.get('/diseases', comparisonController.getDiseaseHistory);
router.get('/timeline', comparisonController.getHealthTimeline);
router.post('/score', comparisonController.createHealthScore);
router.get('/scores', paginationValidator, comparisonController.getHealthScores);
router.get('/score/latest', comparisonController.getLatestHealthScore);

export default router;
