import express from "express";
import authController from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimitMiddleware.js";
import {
	validateRegister,
	validateLogin,
	validateForgotPassword,
	validateResetPassword,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/register", authLimiter, validateRegister, authController.register);
router.post("/login", authLimiter, validateLogin, authController.login);
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.post("/refresh-token", authController.refreshToken);

router.post("/forgot-password", passwordResetLimiter, validateForgotPassword, authController.forgotPassword);
router.post("/reset-password", authLimiter, validateResetPassword, authController.resetPassword);

router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", authenticate, authController.resendEmailVerification);

router.get("/me", authenticate, authController.getMe);
router.post("/update-password", authenticate, authController.updatePassword);

router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback, authController.googleCallbackSuccess);

export default router;
