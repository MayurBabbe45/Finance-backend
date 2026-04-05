import { Request, Response } from 'express';
import { RecordsService } from './records.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export class RecordsController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
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
      const pageStr = String(req.query.page || '1');
      const limitStr = String(req.query.limit || '10');
      const page = parseInt(pageStr, 10);
      const limit = parseInt(limitStr, 10);
      const typeQuery = req.query.type;
      const categoryQuery = req.query.category;
      const filters = {
        type: typeQuery ? String(typeQuery) : undefined,
        category: categoryQuery ? String(categoryQuery) : undefined,
      };

      const result = await RecordsService.getUserRecords(userId, page, limit, filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch records' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const recordId = String(req.params.id);
      await RecordsService.deleteRecord(recordId, userId);
      res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const recordId = String(req.params.id);
      const userId = req.user!.userId;
      const updateData = req.body;
      const updatedRecord = await RecordsService.updateRecord(recordId, userId, updateData);
      res.status(200).json(updatedRecord);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}