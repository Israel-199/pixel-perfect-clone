import { Response } from "express";
import { RequestService } from "../services/requestService";
import { AuthRequest } from "../middlewares/authMiddleware";

export class RequestController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { bookId, paymentProofUrl } = req.body;
      const userId = req.user!.userId;

      const result = await RequestService.createRequest(userId, bookId, paymentProofUrl);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create request." });
    }
  }

  static async getMyRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const requests = await RequestService.getUserRequests(userId);
      res.json({ requests });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch requests." });
    }
  }
}
