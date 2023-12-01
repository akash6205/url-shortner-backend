import mongoose, { Schema } from 'mongoose';

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

const User = mongoose.model('User', UserSchema);

export default User;
