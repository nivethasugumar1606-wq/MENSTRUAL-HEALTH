import { Router } from 'express';
import {
  getLearningProgress,
  completeLesson,
  submitQuizAttempt,
  submitDailyActivity
} from '../controllers/learningController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/progress', getLearningProgress);
router.post('/complete-lesson', completeLesson);
router.post('/quiz-attempt', submitQuizAttempt);
router.post('/daily-activity', submitDailyActivity);

export default router;
