import express from 'express';
import authController from '../controllers/AuthController.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

export default router;
