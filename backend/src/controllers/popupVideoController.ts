import { Request, Response } from "express";
import { PopupVideoService } from "../services/popupVideoService";
import { AuthRequest } from "../middlewares/authMiddleware";

export class PopupVideoController {
  /**
   * Public: returns currently active popup video
   */
  static async getPublic(req: Request, res: Response): Promise<void> {
    try {
      const popup = await PopupVideoService.getPublicPopupVideo();
      res.json({ popup });
    } catch (error: any) {
      console.error("[PopupVideoController.getPublic] Error:", error);
      res.status(500).json({ error: "Failed to fetch popup video." });
    }
  }

  /**
   * Admin: returns the popup video configuration
   */
  static async getAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const popup = await PopupVideoService.getAdminPopupVideo();
      res.json({ popup });
    } catch (error: any) {
      console.error("[PopupVideoController.getAdmin] Error:", error);
      res.status(500).json({ error: "Failed to fetch popup video configuration." });
    }
  }

  /**
   * Admin: updates the popup video configuration
   */
  static async updateAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, videoUrl, thumbnailUrl, ctaText, ctaLink, isActive, autoPlay } = req.body || {};

      const popup = await PopupVideoService.updatePopupVideo({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        ctaText,
        ctaLink,
        isActive,
        autoPlay,
      });

      res.json({
        success: true,
        message: "Popup video configuration saved successfully.",
        popup,
      });
    } catch (error: any) {
      console.error("[PopupVideoController.updateAdmin] Error:", error);
      res.status(500).json({ error: "Failed to update popup video configuration." });
    }
  }
}
