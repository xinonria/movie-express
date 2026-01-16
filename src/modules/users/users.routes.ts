import { Router } from 'express';

import { authenticate } from '../../middlewares/auth';
import { getHistory, getOrders, getProfile } from './users.controller';

const router = Router();

router.get('/me', authenticate, getProfile);
router.get('/me/history', authenticate, getHistory);
router.get('/me/orders', authenticate, getOrders);

export default router;
