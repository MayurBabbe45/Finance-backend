import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['ADMIN', 'ANALYST', 'VIEWER']));

router.get('/summary', DashboardController.getSummary);

export default router;