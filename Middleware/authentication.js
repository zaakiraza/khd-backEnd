import jwt from "jsonwebtoken";
import { errorHandler } from "../Utlis/ResponseHandler.js";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorHandler(res, 401, "Authorization token is required");
    }


    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        errorHandler(res, 401, "Token is required");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return errorHandler(res, 403, "Invalid or expired token");
    }
};