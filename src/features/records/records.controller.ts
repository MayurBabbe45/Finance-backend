import { Request, Response } from 'express';
import { RecordsService } from './records.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export class RecordsController {
  
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      // The user ID is guaranteed to be here because of our auth middleware
      const userId = req.user!.userId; 
      
      const record = await RecordsService.createRecord(userId, req.body);
      res.status(201).json({ message: 'Record created successfully', record });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create record' });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      
      // FIX: Safely convert Express query parameters to strings before parsing
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;

      const result = await RecordsService.getUserRecords(userId, page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch records' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const recordId = req.params.id; // Extracted from the URL path

      await RecordsService.deleteRecord(recordId, userId);
      res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}