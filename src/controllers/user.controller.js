import User from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponce } from '../utils/apiResponce.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'crypto';
import { resend } from '../utils/resend.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        return { accessToken, refreshToken };
    } catch (error) {
        console.log(error);
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    if (!(email && password && name)) {
        throw new apiError(400, 'email, password and name are required');
    }
    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            throw new apiError(400, 'User already exist');
        }
        const user = await User.create({
            email,
            password,
            name,
        });
        const { unHashToken, hashToken } = await user.generateTemporaryToken();
        user.emailVerificationToken = hashToken;
        await user.save();

        const createdUser = await User.findById(user._id).select(
            '-password -refreshToken -emailVerificationToken'
        );
        if (!createdUser) {
            throw new apiError(500, 'something went wrong while creating user');
        }

        // todo: send email verification link

        resend.emails.send({
            from: 'shortener@updates.openurl.me',
            to: 'aditya32ft@gmail.com',
            subject: 'Email verification',
            html: `<h1>Hey ${createdUser.name}</h1>
            <p>Thank you for joining OpenUrl! To activate your account and start exploring, please click the verification link below:</p>
            <a href="${req.protocol}://127.0.0.1:5173/user/auth/verify-email?id=${unHashToken}&email=${email}">Verify My Account</a>


            <p>Best Regards,</p>
            <p>OpenUrl</p>
            `,
        });

        return res
            .status(201)
            .json(
                new apiResponce(
                    201,
                    'User created',
                    { user: createdUser },
                    true
                )
            );
    } catch (error) {
        console.log(error);
        throw new apiError(
            500,
            'something went wrong while creating user',
            error
        );
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!(email && password)) {
        throw new apiError(400, 'email and password are required');
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(new apiError(400, 'User not found'));
        }

        const checkPassword = await user.isCorrectPassword(password);
        if (!checkPassword) {
            return res.status(400).json(new apiError(400, 'Invalid password'));
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        user.refreshToken = refreshToken;
        const userData = await user.save();

        userData.password = undefined;
        userData.refreshToken = undefined;

        return res
            .cookie('token', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            })
            .status(200)
            .json(
                new apiResponce(
                    200,
                    'Login success',
                    {
                        user: userData,
                        accessToken,
                    },
                    true
                )
            );
    } catch (error) {
        throw new apiError(500, 'something went wrong while login', error);
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined,
                },
            },
            {
                new: true,
            }
        );

        return res
            .clearCookie('token', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            })
            .status(200)
            .json(new apiResponce(200, 'Logout success', null, true));
    } catch (error) {
        return res.status(500).json(new apiError(500, error.message));
    }
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    if (!token) {
        throw new apiError(400, 'verification token not found');
    }

    try {
        const hashToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const verifiedUser = await User.findOneAndUpdate(
            { emailVerificationToken: hashToken },
            {
                $set: {
                    emailVerificationToken: '',
                    isEmailVerified: true,
                },
            },
            {
                new: true,
            }
        );
        if (!verifiedUser) {
            throw new apiError(400, 'Invalid token');
        }

        return res
            .status(200)
            .json(new apiResponce(200, 'Email verified', undefined, true));
    } catch (error) {
        throw new apiError(
            500,
            'something went wrong while verifying email',
            error
        );
    }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new apiError(401, 'token not found');
        }
        const vaildateUser = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        );
        if (!vaildateUser) {
            throw new apiError(401, 'token not valid');
        }
        const user = await User.findById(vaildateUser._id);
        if (!user) {
            throw new apiError(401, 'user not found');
        }
        if (token !== user.refreshToken) {
            throw new apiError(401, 'token not valid');
        }
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    refreshToken: refreshToken,
                },
            },
            {
                new: true,
            }
        );
        return res
            .cookie('token', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            })
            .status(200)
            .json(
                new apiResponce(
                    200,
                    'Access token refreshed',
                    { user: updatedUser, accessToken },
                    true
                )
            );
    } catch (error) {
        throw new apiError(
            500,
            'something went wrong while refreshing access token'
        );
    }
});

export { registerUser, loginUser, logoutUser, verifyEmail, refreshAccessToken };
