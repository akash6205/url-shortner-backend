import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const UserSchema = new Schema(
    {
        email: {
            type: String,
            require: [true, 'Email is required'],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            require: [true, 'Password is required'],
        },
        name: {
            type: String,
            require: true,
        },
        refreshToken: {
            type: String,
            require: true,
        },
        profileImg: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
    const accessToken = jwt.sign(
        { _id: this._id, email: this.email },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        }
    );
    return accessToken;
};

UserSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
        }
    );
    return refreshToken;
};

const User = mongoose.model('User', UserSchema);

export default User;
