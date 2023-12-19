import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    refreshAccessToken,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify-email/:token').get(verifyEmail);

// Secure route

router.route('/logout').post(verifyToken, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);

export default router;
