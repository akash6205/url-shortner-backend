import { Router } from 'express';
import {
    shortLink,
    getAllLinks,
    getStats,
    deleteLink,
} from '../controllers/link.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
const router = Router();

// Secure Routes
router.route('/short').post(verifyToken, shortLink);
router.route('/fatchlinks').get(verifyToken, getAllLinks);
router.route('/stats/:key').get(verifyToken, getStats);
router.route('/delete/:_id').delete(verifyToken, deleteLink);

export default router;
