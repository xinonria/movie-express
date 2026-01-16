import { Router } from 'express';

import { authenticate, optionalAuth } from '../../middlewares/auth';
import {
  addMovieCommentById,
  getMovieDetailById,
  getMovieFeatured,
  getMovieList,
  getMoviePlay,
  getMovieRankingsByType,
  rateMovieById,
  recordMovieHistory,
} from './movie.controller';

const router = Router();

router.get('/', getMovieList);
router.get('/featured', getMovieFeatured);
router.get('/rankings/:type', getMovieRankingsByType);
router.get('/:id', optionalAuth, getMovieDetailById);
router.get('/:id/play', optionalAuth, getMoviePlay);
router.post('/:id/comments', authenticate, addMovieCommentById);
router.post('/:id/ratings', authenticate, rateMovieById);
router.post('/:id/history', authenticate, recordMovieHistory);

export default router;
