import { Router } from 'express';
import { shortLink, getAllLinks } from '../controllers/link.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
const router = Router();

// Secure Routes
router.route('/short').post(verifyToken, shortLink);
router.route('/fatchlinks').get(verifyToken, getAllLinks);

export default router;
