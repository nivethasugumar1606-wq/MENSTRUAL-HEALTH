import { Router } from 'express';
import {
  listPeriods,
  createPeriod,
  updatePeriod,
  deletePeriod
} from '../controllers/periodController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listPeriods);
router.post('/', createPeriod);
router.put('/:id', updatePeriod);
router.delete('/:id', deletePeriod);

export default router;
