import { Router } from 'express';
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getTopics);
router.get('/:id', authenticate, getTopicById);
router.post('/', authenticate, requireAdmin, createTopic);
router.put('/:id', authenticate, requireAdmin, updateTopic);
router.delete('/:id', authenticate, requireAdmin, deleteTopic);

export default router;
