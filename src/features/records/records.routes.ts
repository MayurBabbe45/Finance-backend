import { Router } from 'express';
import { RecordsController } from './records.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';
import { validateData } from '../../core/middlewares/validate.middleware';
import { createRecordSchema } from './records.validation';

const router = Router();

// Apply verifyToken to ALL routes in this file. 
// You must be logged in to access financial records.
router.use(verifyToken);

// POST /api/records -> Create a new record
// Note the chain: Verify Token -> Validate Body against Zod -> Execute Controller
router.post(
  '/', 
  requireRole(['ADMIN', 'ANALYST', 'VIEWER']), // Let's allow everyone to create their own records for now
  validateData(createRecordSchema), 
  RecordsController.create
);

// GET /api/records -> Get all records for the logged-in user
router.get('/', RecordsController.getAll);

// DELETE /api/records/:id -> Soft delete a specific record
router.delete('/:id', RecordsController.delete);

// Add this line to your routes file
router.put('/:id', verifyToken, requireRole(['ADMIN', 'ANALYST']), RecordsController.update);

export default router;