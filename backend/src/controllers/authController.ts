import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AuthRequest } from "../middlewares/authMiddleware";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed." });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed." });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Forgot password request failed." });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Reset password failed." });
    }
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await AuthService.getUserProfile(req.user!.userId);
      res.json({ user });
    } catch (error: any) {
      res.status(404).json({ error: error.message || "User profile not found." });
    }
  }
}
