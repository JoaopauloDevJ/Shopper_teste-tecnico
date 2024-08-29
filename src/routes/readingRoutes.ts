import { Router } from 'express';
import { postReading, patchReading, getReading } from '../Controllers/readingControl';

const router = Router();

router.post('/', postReading);
router.patch('/:id', patchReading);
router.get('/:customerCode/list', getReading);

export default router;