"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async register(req, res) {
        try {
            const result = await authService_1.AuthService.register(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Registration failed." });
        }
    }
    static async login(req, res) {
        try {
            const result = await authService_1.AuthService.login(req.body);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Login failed." });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const result = await authService_1.AuthService.forgotPassword(req.body.email);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Forgot password request failed." });
        }
    }
    static async resetPassword(req, res) {
        try {
            const result = await authService_1.AuthService.resetPassword(req.body);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Reset password failed." });
        }
    }
    static async me(req, res) {
        try {
            const user = await authService_1.AuthService.getUserProfile(req.user.userId);
            res.json({ user });
        }
        catch (error) {
            res.status(404).json({ error: error.message || "User profile not found." });
        }
    }
}
exports.AuthController = AuthController;
