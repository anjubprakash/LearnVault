import { Router } from 'express';
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from '../controllers/bookmarkController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getBookmarks);

// Admin-only operations
router.post('/', authenticate, requireAdmin, createBookmark);
router.put('/:id', authenticate, requireAdmin, updateBookmark);
router.delete('/:id', authenticate, requireAdmin, deleteBookmark);

export default router;
