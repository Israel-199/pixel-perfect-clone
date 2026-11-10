import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authRateLimiter, passwordResetLimiter } from "../middlewares/security";

const router = Router();

// Registration: 5 per 15 min per IP (prevents mass account creation)
router.post("/register", authRateLimiter, AuthController.register);

// Login: already rate-limited at app level, extra strict layer here
router.post("/login", AuthController.login);

// Password reset: 5 per hour per IP
router.post("/forgot-password", passwordResetLimiter, AuthController.forgotPassword);
router.post("/reset-password", passwordResetLimiter, AuthController.resetPassword);

// Profile (authenticated)
router.get("/me", authenticateToken, AuthController.me);

export default router;
