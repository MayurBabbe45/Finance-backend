import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export class DashboardController {
  
  static async getSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const summary = await DashboardService.getUserSummary(userId);
      
      res.status(200).json({ summary });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  }
}