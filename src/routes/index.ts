import { Router } from 'express';

import healthRoutes from '../modules/health/health.routes';
import homeRoutes from '../modules/home/home.routes';
import imageRoutes from '../modules/image/image.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/home', homeRoutes);
router.use('/image', imageRoutes);

export default router;
