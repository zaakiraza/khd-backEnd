import express from 'express';
import users from '../Controllers/userController.js';
import { authenticateToken } from '../Middleware/authentication.js';
import { admin } from '../Middleware/admin.js';

export const userRoutes = express.Router();

userRoutes.get("/single/:id", authenticateToken, admin, users.getUser);
userRoutes.get("/all", authenticateToken, admin, users.getAllUser);
userRoutes.put("/update_personal", authenticateToken, users.update_user);
userRoutes.put("/update_class_history/:id", authenticateToken, admin, users.update_class_history);