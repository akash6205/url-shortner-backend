import User from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponce } from '../utils/apiResponce.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    console.log(email, password, name);
    if (!(email && password && name)) {
        return res
            .status(400)
            .json(
                new apiError(
                    400,
                    'email, password and name are required',
                    null,
                    false
                )
            );
    }
    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res
                .status(400)
                .json(new apiError(400, 'User already exist', null, false));
        }
        const user = await User.create({
            email,
            password,
            name,
        });
        const { unHashToken, hashToken } = await user.generateTemporaryToken();
        user.emailVerificationToken = hashToken;
        await user.save({ validateBeforeSave: false });

        const createdUser = await User.findById(user._id).select(
            '-password -refreshToken -emailVerificationToken'
        );
        if (!createdUser) {
            return res
                .status(500)
                .json(
                    new apiError(
                        500,
                        'something went wrong while creating user'
                    )
                );
        }

        // todo: send email verification link

        resend.emails.send({
            from: 'shortener@updates.openurl.me',
            to: 'aditya32ft@gmail.com',
            subject: 'Email verification',
            html: `<h1>Hey ${createdUser.name}</h1>
            <p>Thank you for joining OpenUrl! To activate your account and start exploring, please click the verification link below:</p>
            <a href="${req.protocol}://localhost:5173/user/auth/verify-email?id=${unHashToken}&email=${email}">Verify My Account</a>


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
        return res
            .status(400)
            .json(
                new apiResponce(
                    400,
                    'email and password are required',
                    null,
                    false
                )
            );
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json(new apiResponce(400, 'User not found', null, false));
        }

        const checkPassword = await user.isCorrectPassword(password);
        if (!checkPassword) {
            return res
                .status(400)
                .json(new apiResponce(400, 'Invalid password', null, false));
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
        console.log(error);
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
        return res.status(400).json(new apiError(400, 'Invalid token'));
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
            return res.status(400).json(new apiError(400, 'Invalid token'));
        }

        return res
            .status(200)
            .json(new apiResponce(200, 'Email verified', undefined, true));
    } catch (error) {
        console.log(error);
        throw new apiError(
            500,
            'something went wrong while verifying email',
            error
        );
    }
});

export { registerUser, loginUser, logoutUser, verifyEmail };
