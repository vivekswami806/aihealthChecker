import { Router } from 'express';
import aiAnalysisController from '../controller/aiAnalysisController.js';
import { authenticate } from '../middleware/auth.js';
// import { paginationValidator } from '../middleware/';

const router = Router();

// All AI analysis routes require authentication
router.use(authenticate);

// Analyze a report
router.post('/:reportId/analyze', aiAnalysisController.analyzeReport); 

// Get analysis history
router.get('/history', aiAnalysisController.getAnalysisHistory);

// Get single analysis
router.get('/:id', aiAnalysisController.getAnalysis);

export default router;