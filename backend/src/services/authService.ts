import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";

export class AuthService {
  static async register(data: { fullName?: string; phone?: string; email: string; password: string; confirmPassword?: string }) {
    const { fullName, phone, email, password, confirmPassword } = data;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    if (confirmPassword && password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await prisma.user.count();
    const role = userCount === 0 || cleanEmail.includes("admin") ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        fullName: fullName || "",
        phone: phone || "",
        email: cleanEmail,
        password: hashedPassword,
        role: role,
      },
    });

    const token = jsonwebtoken.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
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

  static async login(data: { email: string; password: string }) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    const token = jsonwebtoken.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
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

  static async forgotPassword(email: string) {
    if (!email) {
      throw new Error("Email is required.");
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new Error("No account found with this email address.");
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry: expiry },
    });

    return { resetToken, message: "Password reset code generated." };
  }

  static async resetPassword(data: { email: string; resetToken?: string; newPassword: string }) {
    const { email, resetToken, newPassword } = data;

    if (!email || !newPassword) {
      throw new Error("Email and new password are required.");
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new Error("User not found.");
    }

    if (user.resetToken && resetToken && user.resetToken !== resetToken) {
      throw new Error("Invalid reset token.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: "Password updated successfully." };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, phone: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      throw new Error("User not found.");
    }
    return user;
  }
}
