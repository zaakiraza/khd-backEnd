import express from "express";
import { uploadFile } from "../Controllers/uploadController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const router = express.Router();

// Upload file route (admin only)
router.post("/upload", authenticateToken, admin, uploadFile);

export default router;
