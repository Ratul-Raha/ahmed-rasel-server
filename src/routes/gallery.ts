import { Router } from 'express';
import { body } from 'express-validator';
import {
  createGalleryItem,
  getGalleryItems,
  updateGalleryItem,
  deleteGalleryItem,
  getAllGalleryAdmin,
  reorderGallery
} from '../controllers/galleryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const validate = (validations: any[]) => validations;

router.get('/', getGalleryItems);

router.post('/', authenticate, authorize('admin', 'editor'), validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('image').notEmpty().withMessage('Image is required'),
  body('category').notEmpty().withMessage('Category is required')
]), createGalleryItem);

router.get('/admin/all', authenticate, authorize('admin'), getAllGalleryAdmin);

router.put('/reorder', authenticate, authorize('admin'), reorderGallery);
router.put('/:id', authenticate, authorize('admin', 'editor'), updateGalleryItem);
router.delete('/:id', authenticate, authorize('admin'), deleteGalleryItem);

export default router;