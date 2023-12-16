import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).json(new apiError(401, 'token not found'));
        }
        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

        if (!decodedToken) {
            return res.status(401).json(new apiError(402, 'Unauthorized user'));
        }
        const user = await User.findById(decodedToken?._id).select(
            '-password -refreshToken'
        );
        if (!user) {
            return res.status(401).json(new apiError(401, 'Unauthorized'));
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json(new apiError(500, error.message));
    }
});
