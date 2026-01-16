import { Router } from 'express';

import { authenticate } from '../../middlewares/auth';
import { getMe, login, register } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
