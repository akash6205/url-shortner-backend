import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json(new ApiError(401, 'token not found'));
        }
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    return res.status(403).json(new ApiError(403, err.message));
                }

                const user = await User.findById(decoded?._id).select(
                    '-password -refreshToken'
                );

                if (!user) {
                    return res
                        .status(401)
                        .json(new ApiError(401, 'Unauthorized'));
                }

                req.user = user;
                next();
            }
        );
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});
