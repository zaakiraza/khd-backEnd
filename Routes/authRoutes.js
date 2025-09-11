import express from 'express';
import auth from '../Controllers/authController.js';
import { authenticateToken } from '../Middleware/authentication.js';

export const authRoutes = express.Router();

authRoutes.post("/signup", auth.signup);

authRoutes.post("/verifyOtp", authenticateToken, auth.verifyOtp);
authRoutes.post("/resendOtp", authenticateToken, auth.resendOtp);

authRoutes.post("/setPassword", authenticateToken, auth.setPassword);

authRoutes.post("/forget_passwordOtp", auth.forgotPasswordOtp);
authRoutes.post("/verify_forget_PasswordOtp", auth.verifyChangePasswordOtp);


authRoutes.post("/forgot_password", auth.forgotPassword);

authRoutes.post("/change_password", authenticateToken, auth.changePassword);
authRoutes.post("/admin_login", auth.adminLogin);

authRoutes.post("/login", auth.loginUser);