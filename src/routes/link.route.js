import { Router } from 'express';
import { redirect, shortLink } from '../controllers/link.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
const router = Router();

router.route('/:key').get(redirect);

// Secure Routes
router.route('/short').post(verifyToken, shortLink);

export default router;
