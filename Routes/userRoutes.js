import express from 'express';
import users from '../Controllers/userController.js';
import { authenticateToken } from '../Middleware/authentication.js';
import { admin } from '../Middleware/admin.js';

export const userRoutes = express.Router();

userRoutes.get("/single", authenticateToken, users.getUser);
userRoutes.get("/all", authenticateToken, admin, users.getAllUser);
userRoutes.get("/count", authenticateToken, admin, users.getUserCount);
userRoutes.get("/active", authenticateToken, admin, users.getActiveUser);
userRoutes.get("/pending", authenticateToken, admin, users.getPendingUser);
userRoutes.put("/update_personal", authenticateToken, users.update_user);
userRoutes.put("/update_class_history/:id", authenticateToken, admin, users.update_class_history);
userRoutes.put("/update_application_status/:id", authenticateToken, admin, users.update_application_status);