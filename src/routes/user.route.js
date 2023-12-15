import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// Secure route

router.route('/logout').post(verifyToken, logoutUser);

export default router;
