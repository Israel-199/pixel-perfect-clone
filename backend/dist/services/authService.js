"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class AuthService {
    static async register(data) {
        const { fullName, phone, email, password, confirmPassword } = data;
        if (!fullName || !fullName.trim()) {
            throw new Error("ሙሉ ስም ማስገባት ተገቢ ነው (Full Name is required).");
        }
        if (!phone || !phone.trim() || phone.trim().length < 9) {
            throw new Error("ትክክለኛ ስልክ ቁጥር ማስገባት ተገቢ ነው (A valid Phone Number is required).");
        }
        if (!email || !email.trim()) {
            throw new Error("ኢሜይል አድራሻ ማስገባት ተገቢ ነው (Email is required).");
        }
        const cleanEmail = email.toLowerCase().trim();
        if (!EMAIL_REGEX.test(cleanEmail)) {
            throw new Error("ትክክለኛ የኢሜይል አድራሻ ያስገቡ (Please provide a valid email address).");
        }
        if (!password) {
            throw new Error("የይለፍ ቃል ማስገባት ተገቢ ነው (Password is required).");
        }
        if (password.length < 6) {
            throw new Error("የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት (Password must be at least 6 characters).");
        }
        if (confirmPassword && password !== confirmPassword) {
            throw new Error("የይለፍ ቃሎቹ አይመሳሰሉም (Passwords do not match).");
        }
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existingUser) {
            throw new Error("በዚህ ኢሜይል የተመዘገበ ተጠቃሚ አለ (User with this email already exists).");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userCount = await prisma_1.prisma.user.count();
        const role = userCount === 0 || cleanEmail.includes("admin") ? "ADMIN" : "USER";
        const user = await prisma_1.prisma.user.create({
            data: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                email: cleanEmail,
                password: hashedPassword,
                role: role,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });
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
        const { email, password } = data;
        if (!email || !email.trim()) {
            throw new Error("ኢሜይል ማስገባት ተገቢ ነው (Email is required).");
        }
        const cleanEmail = email.toLowerCase().trim();
        if (!EMAIL_REGEX.test(cleanEmail)) {
            throw new Error("ትክክለኛ የኢሜይል አድራሻ ያስገቡ (Please enter a valid email).");
        }
        if (!password) {
            throw new Error("የይለፍ ቃል ማስገባት ተገቢ ነው (Password is required).");
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) {
            throw new Error("የተሳሳተ ኢሜይል ወይም የይለፍ ቃል (Invalid email or password).");
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error("የተሳሳተ ኢሜይል ወይም የይለፍ ቃል (Invalid email or password).");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });
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
        if (!email || !email.trim()) {
            throw new Error("ኢሜይል አድራሻ ማስገባት ተገቢ ነው (Email is required).");
        }
        const cleanEmail = email.toLowerCase().trim();
        if (!EMAIL_REGEX.test(cleanEmail)) {
            throw new Error("ትክክለኛ የኢሜይል አድራሻ ያስገቡ (Please enter a valid email).");
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) {
            throw new Error("በዚህ ኢሜይል አድራሻ የተመዘገበ አካውንት አልተገኘም (No account found with this email).");
        }
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 3600000);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry: expiry },
        });
        return { resetToken, message: "የማረጋገጫ ኮድ ተልኳል (Reset code generated successfully)." };
    }
    static async resetPassword(data) {
        const { email, resetToken, newPassword } = data;
        if (!email || !email.trim()) {
            throw new Error("ኢሜይል ማስገባት ተገቢ ነው (Email is required).");
        }
        if (!newPassword || newPassword.length < 6) {
            throw new Error("አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት (New password must be at least 6 characters).");
        }
        const cleanEmail = email.toLowerCase().trim();
        const user = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) {
            throw new Error("ተጠቃሚው አልተገኘም (User not found).");
        }
        if (user.resetToken && resetToken && user.resetToken !== resetToken) {
            throw new Error("የተሳሳተ የማረጋገጫ ኮድ (Invalid reset token).");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        return { message: "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል (Password updated successfully)." };
    }
    static async getUserProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, fullName: true, phone: true, email: true, role: true, createdAt: true },
        });
        if (!user) {
            throw new Error("ተጠቃሚ አልተገኘም (User not found).");
        }
        return user;
    }
}
exports.AuthService = AuthService;
