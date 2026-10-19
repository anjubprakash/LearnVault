import { Router } from 'express';
import { getAdminStats, getUsers, createUser, deleteUser } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

export default router;
