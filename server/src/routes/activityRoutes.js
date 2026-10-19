import { Router } from 'express';
import { getActivities } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getActivities);

export default router;
