import { Router } from 'express';
import chatController from '../controller/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', chatController.listConversations);
router.post('/', chatController.createConversation);
router.post('/message', chatController.sendMessage);
router.get('/:id', chatController.getConversation);
router.delete('/:id', chatController.deleteConversation);

export default router;
