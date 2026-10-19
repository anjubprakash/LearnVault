import { Router } from 'express';
import {
  getVideos,
  getVideoById,
  addVideo,
  recordWatch,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getVideos);
router.get('/:id', authenticate, getVideoById);
router.post('/:id/watch', authenticate, recordWatch);

// Admin-only operations
router.post('/', authenticate, requireAdmin, addVideo);
router.put('/:id', authenticate, requireAdmin, updateVideo);
router.delete('/:id', authenticate, requireAdmin, deleteVideo);

export default router;
