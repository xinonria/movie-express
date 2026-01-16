import { Router } from 'express';

import { getPersonDetail, listPersons } from './persons.controller';

const router = Router();

router.get('/', listPersons);
router.get('/:id', getPersonDetail);

export default router;
