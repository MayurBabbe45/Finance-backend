import { Router } from 'express';
import { AuthController } from './auth.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// --- PROTECTED ROUTES TEST ---
// 1. Requires valid JWT
// 2. Requires the user to have either the 'ADMIN' or 'ANALYST' role
router.get(
  '/me', 
  verifyToken, 
  requireRole(['ADMIN', 'ANALYST']), 
  AuthController.getProfile
);

export default router;