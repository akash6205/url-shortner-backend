import Link from '../models/link.model.js';
import { apiResponce } from '../utils/apiResponce.js';
import { apiError } from '../utils/apiError.js';
import crypto from 'crypto';
import { getmetaData } from '../utils/getMetaData.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const redirect = async (req, res) => {
    try {
        const { key } = req.params;
        const linkData = await Link.findOne({ key });
        if (!linkData) {
            return res.status(404).json(new apiError(404, 'page not found'));
        }
        linkData.clicks++;
        await linkData.save();
        res.redirect(linkData.originUrl);
    } catch (error) {
        return res
            .status(500)
            .json(new apiError(500, 'error while redirecting', error));
    }
};

const shortLink = async (req, res) => {
    const { _id } = req.user;
    const { link } = req.body;

    if (!link) {
        return res.status(400).json(new apiError(400, 'url is required'));
    }
    try {
        const user = await User.findById(_id);
        const metaData = await getmetaData(link);
        const key = crypto.randomBytes(4).toString('hex');
        const shortenLink = await Link.create({
            key: key,
            originUrl: link,
            user: user._id,
            title: metaData?.title,
            description: metaData?.description,
            image: metaData?.image,
            icon: metaData?.icon,
        });
        const data = await Link.findById(shortenLink._id);

        res.status(200).json(
            new apiResponce(200, 'link created', { link: data }, true)
        );
    } catch (error) {
        return res
            .status(500)
            .json(new apiError(500, 'error while shorting link', error));
    }
};

const getAllLinks = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id) {
            throw new apiError(401, 'unauthorized', null, false);
        }
        const links = await Link.find({ user: _id });
        res.status(200).json(
            new apiResponce(200, 'links', { links: links }, true)
        );
    } catch (error) {
        throw new apiError(500, 'error while getting links', error);
    }
});

export { shortLink, redirect, getAllLinks };
