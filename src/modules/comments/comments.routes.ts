import { Router } from 'express';

import { authenticate } from '../../middlewares/auth';
import { toggleCommentVote } from './comments.controller';

const router = Router();

router.post('/:id/vote', authenticate, toggleCommentVote);

export default router;
