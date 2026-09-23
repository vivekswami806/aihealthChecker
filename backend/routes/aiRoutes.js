import { Router } from 'express';
import aiAnalysisController from '../controller/aiAnalysisController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
// routes
router.get('/history', aiAnalysisController.getAnalysisHistory);
router.get('/:reportId/status', aiAnalysisController.getAnalysisStatus);
router.post('/:reportId/analyze', aiAnalysisController.analyzeReport);
router.get('/report/:reportId', aiAnalysisController.getAnalysisByReport);
router.get('/:id', aiAnalysisController.getAnalysis);

export default router;
