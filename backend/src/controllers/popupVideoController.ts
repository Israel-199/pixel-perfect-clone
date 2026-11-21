import { Request, Response } from "express";
import { PopupVideoService } from "../services/popupVideoService";
import { AuthRequest } from "../middlewares/authMiddleware";

export class PopupVideoController {
  /**
   * Public: returns all active popup videos
   */
  static async getPublic(req: Request, res: Response): Promise<void> {
    try {
      const videos = await PopupVideoService.getPublicPopupVideos();
      res.json({
        videos,
        popup: videos.length > 0 ? videos[0] : null,
      });
    } catch (error: any) {
      console.error("[PopupVideoController.getPublic] Error:", error);
      res.status(500).json({ error: "Failed to fetch popup videos." });
    }
  }

  /**
   * Admin: returns all popup videos
   */
  static async getAllAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const videos = await PopupVideoService.getAllAdminPopupVideos();
      res.json({
        videos,
        popup: videos.length > 0 ? videos[0] : null,
      });
    } catch (error: any) {
      console.error("[PopupVideoController.getAllAdmin] Error:", error);
      res.status(500).json({ error: "Failed to fetch popup videos." });
    }
  }

  /**
   * Admin: creates a new popup video
   */
  static async createAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, videoUrl, thumbnailUrl, ctaText, ctaLink, isActive, autoPlay, order } = req.body || {};

      if (!videoUrl || !videoUrl.trim()) {
        res.status(400).json({ error: "Video URL is required." });
        return;
      }

      const video = await PopupVideoService.createPopupVideo({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        ctaText,
        ctaLink,
        isActive,
        autoPlay,
        order,
      });

      res.status(201).json({
        success: true,
        message: "Popup video created successfully.",
        video,
      });
    } catch (error: any) {
      console.error("[PopupVideoController.createAdmin] Error:", error);
      res.status(500).json({ error: "Failed to create popup video." });
    }
  }

  /**
   * Admin: updates an existing popup video
   */
  static async updateAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { title, description, videoUrl, thumbnailUrl, ctaText, ctaLink, isActive, autoPlay, order } = req.body || {};

      if (!id) {
        // Fallback for single/default update
        const videos = await PopupVideoService.getAllAdminPopupVideos();
        if (videos.length > 0) {
          const updated = await PopupVideoService.updatePopupVideo(videos[0].id, {
            title,
            description,
            videoUrl,
            thumbnailUrl,
            ctaText,
            ctaLink,
            isActive,
            autoPlay,
            order,
          });
          res.json({
            success: true,
            message: "Popup video updated successfully.",
            video: updated,
            popup: updated,
          });
          return;
        } else {
          // If none exist, create one
          const created = await PopupVideoService.createPopupVideo({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            ctaText,
            ctaLink,
            isActive,
            autoPlay,
            order,
          });
          res.json({
            success: true,
            message: "Popup video created successfully.",
            video: created,
            popup: created,
          });
          return;
        }
      }

      const updated = await PopupVideoService.updatePopupVideo(id, {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        ctaText,
        ctaLink,
        isActive,
        autoPlay,
        order,
      });

      res.json({
        success: true,
        message: "Popup video updated successfully.",
        video: updated,
      });
    } catch (error: any) {
      console.error("[PopupVideoController.updateAdmin] Error:", error);
      res.status(500).json({ error: "Failed to update popup video." });
    }
  }

  /**
   * Admin: deletes a popup video
   */
  static async deleteAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ error: "Video ID is required." });
        return;
      }

      await PopupVideoService.deletePopupVideo(id);
      res.json({
        success: true,
        message: "Popup video deleted successfully.",
      });
    } catch (error: any) {
      console.error("[PopupVideoController.deleteAdmin] Error:", error);
      res.status(500).json({ error: "Failed to delete popup video." });
    }
  }

  /**
   * Admin: reorders popup videos
   */
  static async reorderAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { orderedIds } = req.body || {};
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ error: "orderedIds array is required." });
        return;
      }

      await PopupVideoService.reorderPopupVideos(orderedIds);
      res.json({
        success: true,
        message: "Videos reordered successfully.",
      });
    } catch (error: any) {
      console.error("[PopupVideoController.reorderAdmin] Error:", error);
      res.status(500).json({ error: "Failed to reorder videos." });
    }
  }
}
