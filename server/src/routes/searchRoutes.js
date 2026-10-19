import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, globalSearch);

export default router;
