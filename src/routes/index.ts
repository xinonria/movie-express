import { Router } from 'express';

import healthRoutes from '../modules/health/health.routes';
import homeRoutes from '../modules/home/home.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/home', homeRoutes);

export default router;
