"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_1 = require("../middlewares/validation");
const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
// Account lockout: 5 failed attempts → lock for 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
class AuthService {
    static async register(data) {
        const { confirmPassword } = data;
        // — Validated & sanitised fields —
        const fullName = (0, validation_1.validateString)(data.fullName, "ሙሉ ስም (Full Name)", {
            required: true,
            min: 2,
            max: 100,
        });
        const phone = (0, validation_1.validatePhone)(data.phone);
        const cleanEmail = (0, validation_1.validateEmail)(data.email);
        const password = (0, validation_1.validatePassword)(data.password);
        if (confirmPassword && password !== confirmPassword) {
            throw new Error("የይለፍ ቃሎቹ አይመሳሰሉም (Passwords do not match).");
        }
        // Block disposable/throwaway email domains
        const disposableDomains = ["mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "throwam.com"];
        const emailDomain = cleanEmail.split("@")[1];
        if (disposableDomains.includes(emailDomain)) {
            throw new Error("Disposable email addresses are not allowed.");
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: cleanEmail },
        });
        if (existingUser) {
            throw new Error("በዚህ ኢሜይል የተመዘገበ ተጠቃሚ አለ (User with this email already exists).");
        }
        // Use bcrypt cost factor 12 (stronger than 10)
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Only grant ADMIN if first user ever — never based on email content
        const userCount = await prisma_1.prisma.user.count();
        const role = userCount === 0 ? "ADMIN" : "USER";
        const user = await prisma_1.prisma.user.create({
            data: {
                fullName,
                phone,
                email: cleanEmail,
                password: hashedPassword,
                role: role,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return {
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                role: user.role,
            },
        };
    }
    static async login(data) {
        const cleanEmail = (0, validation_1.validateEmail)(data.email);
        if (!data.password || typeof data.password !== "string") {
            throw new Error("የይለፍ ቃል ማስገባት ተገቢ ነው (Password is required).");
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: cleanEmail },
        });
        // Generic error — never reveal whether email exists
        const genericError = "የተሳሳተ ኢሜይል ወይም የይለፍ ቃል (Invalid email or password).";
        if (!user)
            throw new Error(genericError);
        // — Account lockout check —
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new Error(`Account temporarily locked due to too many failed attempts. Try again in ${mins} minute(s).`);
        }
        const isMatch = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isMatch) {
            const newAttempts = (user.loginAttempts ?? 0) + 1;
            const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    loginAttempts: newAttempts,
                    lockedUntil: shouldLock
                        ? new Date(Date.now() + LOCK_DURATION_MS)
                        : null,
                },
            });
            if (shouldLock) {
                throw new Error("Too many failed login attempts. Account locked for 30 minutes.");
            }
            const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
            throw new Error(`${genericError} ${remaining} attempt(s) remaining before lockout.`);
        }
        // — Successful login: reset failure counters —
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockedUntil: null },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return {
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                role: user.role,
            },
        };
    }
    static async forgotPassword(email) {
        const cleanEmail = (0, validation_1.validateEmail)(email);
        const user = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
        // Always return success — don't reveal whether email exists (prevents enumeration)
        if (!user) {
            return {
                message: "If an account with that email exists, a reset code has been sent.",
            };
        }
        // Cryptographically secure 6-digit token
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const resetToken = String(100000 + (array[0] % 900000));
        const expiry = new Date(Date.now() + 3600000); // 1 hour
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry: expiry },
        });
        return {
            resetToken,
            message: "If an account with that email exists, a reset code has been sent.",
        };
    }
    static async resetPassword(data) {
        const cleanEmail = (0, validation_1.validateEmail)(data.email);
        const newPassword = (0, validation_1.validatePassword)(data.newPassword, "New password");
        const user = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user)
            throw new Error("ተጠቃሚው አልተገኘም (User not found).");
        // Validate token and expiry
        if (!user.resetToken || !data.resetToken) {
            throw new Error("No password reset was requested for this account.");
        }
        if (user.resetToken !== data.resetToken) {
            throw new Error("የተሳሳተ የማረጋገጫ ኮድ (Invalid reset token).");
        }
        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            // Clear expired token
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { resetToken: null, resetTokenExpiry: null },
            });
            throw new Error("Reset token has expired. Please request a new one.");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                loginAttempts: 0,
                lockedUntil: null,
            },
        });
        return {
            message: "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል (Password updated successfully).",
        };
    }
    static async getUserProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new Error("ተጠቃሚ አልተገኘም (User not found).");
        return user;
    }
}
exports.AuthService = AuthService;
