import { Router } from 'express';

import { authenticate } from '../../middlewares/auth';
import { upgradeVip } from './order.controller';

const router = Router();

router.post('/vip', authenticate, upgradeVip);

export default router;
