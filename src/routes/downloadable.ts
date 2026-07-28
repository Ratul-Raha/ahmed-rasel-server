import { Router } from 'express';
import { body } from 'express-validator';
import {
  createDownloadable,
  getDownloadables,
  getAllDownloadablesAdmin,
  updateDownloadable,
  deleteDownloadable
} from '../controllers/downloadableController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const validate = (validations: any[]) => validations;

router.get('/', getDownloadables);

router.post('/', authenticate, authorize('admin', 'editor'), validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('file').notEmpty().withMessage('File is required')
]), createDownloadable);

router.get('/admin/all', authenticate, authorize('admin'), getAllDownloadablesAdmin);

router.put('/:id', authenticate, authorize('admin', 'editor'), updateDownloadable);
router.delete('/:id', authenticate, authorize('admin'), deleteDownloadable);

export default router;
