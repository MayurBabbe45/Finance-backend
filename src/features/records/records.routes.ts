import { Router } from 'express';
import { RecordsController } from './records.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';
import { validateData } from '../../core/middlewares/validate.middleware';
import { createRecordSchema } from './records.validation';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  requireRole(['ADMIN', 'ANALYST', 'VIEWER']),
  validateData(createRecordSchema),
  RecordsController.create
);

router.get('/', RecordsController.getAll);
router.delete('/:id', RecordsController.delete);
router.put('/:id', verifyToken, requireRole(['ADMIN', 'ANALYST']), RecordsController.update);

export default router;