import { Router } from 'express';
import { body } from 'express-validator';
import {
  createSeminar,
  getSeminars,
  getSeminar,
  getAllSeminarsAdmin,
  updateSeminar,
  deleteSeminar,
  registerForSeminar,
  getRegistrations
} from '../controllers/seminarController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const validate = (validations: any[]) => validations;

// Public routes
router.get('/', getSeminars);
router.get('/:id', getSeminar);

// Registration (public)
router.post('/:seminarId/register', validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('country').notEmpty().withMessage('Country is required')
]), registerForSeminar);

// Admin routes
router.post('/', authenticate, authorize('admin', 'editor'), validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('url').notEmpty().withMessage('Seminar URL is required'),
  body('dateTime').notEmpty().withMessage('Date and time is required')
]), createSeminar);

router.get('/admin/all', authenticate, authorize('admin'), getAllSeminarsAdmin);

router.put('/:id', authenticate, authorize('admin', 'editor'), updateSeminar);
router.delete('/:id', authenticate, authorize('admin'), deleteSeminar);

router.get('/:seminarId/registrations', authenticate, authorize('admin'), getRegistrations);

export default router;