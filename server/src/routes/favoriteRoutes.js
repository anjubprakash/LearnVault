import { Router } from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getFavorites);
router.post('/toggle', authenticate, toggleFavorite);

export default router;
