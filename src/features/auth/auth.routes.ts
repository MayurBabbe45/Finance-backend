import { Router } from 'express';
import { AuthController } from './auth.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.get('/me', verifyToken, requireRole(['ADMIN', 'ANALYST']), AuthController.getProfile);

export default router;