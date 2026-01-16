import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes';
import commentRoutes from '../modules/comments/comments.routes';
import healthRoutes from '../modules/health/health.routes';
import imageRoutes from '../modules/image/image.routes';
import movieRoutes from '../modules/movie/movie.routes';
import orderRoutes from '../modules/orders/order.routes';
import personRoutes from '../modules/persons/persons.routes';
import userRoutes from '../modules/users/users.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
router.use('/persons', personRoutes);
router.use('/comments', commentRoutes);
router.use('/orders', orderRoutes);
router.use('/images', imageRoutes);

export default router;
