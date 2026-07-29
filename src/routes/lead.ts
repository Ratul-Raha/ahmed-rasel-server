import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getLeads,
  getLead,
  updateLead,
  deleteLead
} from '../controllers/leadController';

const router = Router();

router.get('/', authenticate, authorize('admin'), getLeads);
router.get('/:id', authenticate, authorize('admin'), getLead);
router.put('/:id', authenticate, authorize('admin'), updateLead);
router.delete('/:id', authenticate, authorize('admin'), deleteLead);

export default router;