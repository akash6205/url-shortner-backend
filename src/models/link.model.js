import mongoose, { Schema } from 'mongoose';

const LinkSchema = new Schema(
    {
        key: {
            type: String,
            require: true,
            index: true,
        },
        originUrl: {
            type: String,
            require: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        clicks: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        icon: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        expireAt: {
            type: Date,
            default: Date.now,
            index: { expires: '120m' },
        },
    },
    { timestamps: true }
);
const Link = mongoose.model('Link', LinkSchema);

export default Link;
