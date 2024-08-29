import { Router } from 'express';
import { postLeitura, patchLeitura, getLeituras } from '../Controllers/readingControl';

const router = Router();

router.post('/', postLeitura);
router.patch('/:id', patchLeitura);
router.get('/:customerCode/list', getLeituras);

export default router;