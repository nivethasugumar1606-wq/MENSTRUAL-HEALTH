import { Router } from 'express';
import {
  listJournalEntries,
  upsertJournalEntry,
  getJournalEntryByDate,
  deleteJournalEntry
} from '../controllers/journalController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listJournalEntries);
router.post('/', upsertJournalEntry);
router.get('/date/:date', getJournalEntryByDate);
router.delete('/:id', deleteJournalEntry);

export default router;
