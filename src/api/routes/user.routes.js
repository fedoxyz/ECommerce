import express from 'express';
import userController from '../controllers/UserController.js';
import { authenticate } from '../middleware/auth.js';
import { validateUpdateProfile, validateChangePassword } from '../validators/user.validator.js';

const router = express.Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateUpdateProfile, userController.updateProfile);
router.post('/change-password', authenticate, validateChangePassword, userController.changePassword);

export default router;
