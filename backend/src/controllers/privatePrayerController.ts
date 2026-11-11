import { Request, Response } from "express";
import { PrivatePrayerService } from "../services/privatePrayerService";

export class PrivatePrayerController {
  // Public submission of private prayers
  static async submitPrayer(req: Request, res: Response) {
    try {
      const { title, description, submittedBy, contactInfo } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "ርዕስ እና የጸሎት ዝርዝር አስፈላጊ ናቸው (Title and description are required)" });
      }

      const prayer = await PrivatePrayerService.createPrayer({
        title,
        description,
        submittedBy,
        contactInfo,
      });

      res.status(201).json({
        message: "የግል ጸሎትዎ በምስጢር ደርሷል",
        prayer: { id: prayer.id, createdAt: prayer.createdAt },
      });
    } catch (error: any) {
      console.error("Submit Private Prayer Error:", error);
      res.status(500).json({ error: error.message || "Failed to submit prayer" });
    }
  }

  // Admin: View all submitted private prayers
  static async getAllPrayers(req: Request, res: Response) {
    try {
      const query = (res.locals?.normalizedQuery || res.locals?.query || req.query || {}) as Record<string, any>;
      const filter = typeof query.filter === "string" ? query.filter : undefined;
      const prayers = await PrivatePrayerService.getAllPrayers(filter);
      res.json({ prayers });
    } catch (error: any) {
      console.error("Get Private Prayers Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch private prayers" });
    }
  }

  // Admin: Toggle prayed/reviewed status
  static async toggleStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const updated = await PrivatePrayerService.togglePrayedStatus(id);
      res.json({ message: "Status updated successfully", prayer: updated });
    } catch (error: any) {
      console.error("Toggle Status Error:", error);
      res.status(500).json({ error: error.message || "Failed to update status" });
    }
  }

  // Admin: Delete prayer
  static async deletePrayer(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await PrivatePrayerService.deletePrayer(id);
      res.json({ message: "Private prayer deleted successfully" });
    } catch (error: any) {
      console.error("Delete Prayer Error:", error);
      res.status(500).json({ error: error.message || "Failed to delete prayer" });
    }
  }
}
