import verify from 'jsonwebtoken';
import { errorHandler } from '../Utlis/ResponseHandler.js';
import User from '../Models/user.js';

export const admin = async (req, res, next) => {
    const userId = req.user
    try {
        const userDetail = await User.findById(userId.userId);
        if (!userDetail) {
            return errorHandler(res, 400, "Invalid user");
        }
        if (!userDetail.personal_info.isAdmin) {
            return errorHandler(res, 403, "Access denied: Admins only");
        }
        req.user = userDetail;
        next();
    }
    catch (err) {
        errorHandler(res, 401, "Unauthorized: Invalid token");
    }
};
