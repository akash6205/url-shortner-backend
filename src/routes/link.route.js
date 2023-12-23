import { Router } from 'express';
import {
    shortLink,
    getAllLinks,
    getStats,
} from '../controllers/link.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
const router = Router();

// Secure Routes
router.route('/short').post(verifyToken, shortLink);
router.route('/fatchlinks').get(verifyToken, getAllLinks);
router.route('/stats/:key').get(verifyToken, getStats);

export default router;
