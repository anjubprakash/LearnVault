import { Router } from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getNotes);
router.get('/:id', authenticate, getNoteById);

// Admin-only operations
router.post('/', authenticate, requireAdmin, createNote);
router.put('/:id', authenticate, requireAdmin, updateNote);
router.delete('/:id', authenticate, requireAdmin, deleteNote);

export default router;
