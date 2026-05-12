import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  getBlogCategories
} from '../controllers/blogController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const validate = (validations: any[]) => validations;

router.get('/', getBlogs);
router.get('/categories', getBlogCategories);
router.get('/featured', getBlogs);
router.get('/:slug', getBlogBySlug);

router.post('/', authenticate, authorize('admin', 'editor'), validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required')
]), createBlog);

router.get('/admin/all', authenticate, authorize('admin'), getAllBlogsAdmin);

router.delete('/:identifier', authenticate, authorize('admin'), deleteBlog);
router.put('/:identifier', authenticate, authorize('admin', 'editor'), updateBlog);
router.get('/:slug', getBlogBySlug);

export default router;