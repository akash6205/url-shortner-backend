import mongoose, { Schema } from 'mongoose';

const LinkSchema = new Schema(
    {
        route: {
            type: String,
            require: true,
            index: true,
        },
        destinationUrl: {
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
        qrCode: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Link = mongoose.model('Link', LinkSchema);

export default Link;
