import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  exportUserData,
  deleteAccount
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);
router.get('/export', requireAuth, exportUserData);
router.delete('/account', requireAuth, deleteAccount);

export default router;
