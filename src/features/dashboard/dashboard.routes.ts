import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';

const router = Router();

// Apply auth middleware. Viewers, Analysts, and Admins can all see the dashboard.
router.use(verifyToken);
router.use(requireRole(['ADMIN', 'ANALYST', 'VIEWER']));

// GET /api/dashboard/summary
router.get('/summary', DashboardController.getSummary);

export default router;