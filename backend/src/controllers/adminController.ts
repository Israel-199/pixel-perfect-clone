import { Response } from "express";
import { AdminService } from "../services/adminService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { cloudinary } from "../config/cloudinary";

export class AdminController {
  static async getAllRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      const requests = await AdminService.getAllRequests();
      res.json({ requests });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch admin requests." });
    }
  }

  static async updateRequestStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;
      const updated = await AdminService.updateRequestStatus(id, status);
      res.json({ request: updated, message: `Request status updated to ${status}` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update status." });
    }
  }

  static async createBook(req: AuthRequest, res: Response): Promise<void> {
    try {
      const book = await AdminService.createBook(req.body);
      res.status(201).json({ book, message: "Book created successfully." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create book." });
    }
  }

  static async updateBook(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const book = await AdminService.updateBook(id, req.body);
      res.json({ book, message: "Book updated successfully." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update book." });
    }
  }

  static async deleteBook(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await AdminService.deleteBook(id);
      res.json({ success: true, message: "Book deleted successfully." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete book." });
    }
  }

  static async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      const resourceType = req.body.resourceType || "auto";

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "rabbi_church_assets", resource_type: resourceType },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary error:", error);
            res.status(500).json({ error: "Cloudinary upload failed." });
            return;
          }

          res.json({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (error: any) {
      res.status(500).json({ error: "File upload failed." });
    }
  }
}
