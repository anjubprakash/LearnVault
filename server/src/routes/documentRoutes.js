import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  viewDocumentStream,
  downloadDocument,
  uploadDocument,
  updateDocumentMetadata,
  deleteDocument,
} from '../controllers/documentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = Router();

router.get('/', authenticate, getDocuments);
router.get('/:id', authenticate, getDocumentById);
router.get('/:id/view', authenticate, viewDocumentStream);
router.get('/:id/download', authenticate, downloadDocument);

// Admin-only operations
router.post('/upload', authenticate, requireAdmin, uploadMiddleware.single('file'), uploadDocument);
router.put('/:id', authenticate, requireAdmin, updateDocumentMetadata);
router.delete('/:id', authenticate, requireAdmin, deleteDocument);

export default router;
