import { Router } from 'express';
import { register, login, refreshToken, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', (req: any, res: any) => register(req, res));
router.post('/login', (req: any, res: any) => login(req, res));
router.post('/refresh-token', (req: any, res: any) => refreshToken(req, res));
router.get('/me', authenticate as any, (req: any, res: any) => getMe(req, res));
router.post('/logout', (req: any, res: any) => logout(req, res));

export default router;