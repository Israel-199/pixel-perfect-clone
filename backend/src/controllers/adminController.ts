import { Request, Response, NextFunction } from "express";
import path from "path";
import { AdminService } from "../services/adminService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { cloudinary, deleteFromCloudinary, deleteFilesFromCloudinaryAsync } from "../config/cloudinary";

// ── Multer error handler (must be Express 4-style: 4-arg) ─────────────────────
export function handleMulterError(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err?.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "ፋይሉ በጣም ትልቅ ነው። ከ50MB በታች ያለ ፋይል ይጠቀሙ። (File too large. Max 50 MB.)" });
    return;
  }
  if (err?.message?.startsWith("Unsupported file type")) {
    res.status(415).json({ error: `ይህ የፋይል አይነት አይፈቀድም። (${err.message})` });
    return;
  }
  if (err) { next(err); return; }
  next();
}

export class AdminController {
  static async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch dashboard statistics." });
    }
  }

  static async getContentsWithStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const contents = await AdminService.getContentsWithStats();
      res.json({ contents });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch contents with statistics." });
    }
  }

  static async getAllRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Safe query parameter handling via res.locals and local variables for Express 5
      const query = (res.locals?.normalizedQuery || res.locals?.query || req.query || {}) as Record<string, any>;
      const status = typeof query.status === "string" ? query.status : undefined;
      const requests = await AdminService.getAllRequests(status);
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
      const originalName = req.file.originalname || "document";
      const ext = path.extname(originalName).toLowerCase();

      const uploadOptions: Record<string, any> = {
        folder: "rabbi_church_assets",
        resource_type: resourceType,
        // Large chunk size → fewer round-trips → faster upload
        chunk_size: 6 * 1024 * 1024, // 6 MB chunks
        timeout: 120000, // 2 min timeout for large files
        // Eager transformations off — only on demand
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      };

      // For document files (.docx, .doc, .pdf) preserve extension in public_id
      if (
        resourceType === "raw" ||
        ext === ".docx" ||
        ext === ".doc" ||
        ext === ".pdf"
      ) {
        const baseName = path
          .basename(originalName, ext)
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .substring(0, 60);
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e4);
        uploadOptions.public_id = `${baseName || "doc"}_${uniqueSuffix}${ext}`;
        uploadOptions.resource_type = "raw";
        // For raw/documents, disable any image transformations
        delete uploadOptions.eager;
      }

      // For images: auto-quality and auto-format for faster delivery
      if (resourceType === "image" || (!resourceType && ext.match(/\.(jpe?g|png|webp|gif)$/i))) {
        uploadOptions.quality = "auto:good";
        uploadOptions.fetch_format = "auto";
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error?.message || error);
            res.status(500).json({ error: "Cloudinary upload failed. Please try again." });
            return;
          }

          res.json({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format || ext.replace(/^\./, ""),
            original_filename: originalName,
            bytes: result.bytes,
          });
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (error: any) {
      console.error("uploadFile error:", error?.message);
      res.status(500).json({ error: "File upload failed." });
    }
  }

  static async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { url, publicId, resourceType } = req.body || {};
      if (!url && !publicId) {
        res.status(400).json({ error: "URL or publicId is required." });
        return;
      }

      // Fast non-blocking background deletion
      deleteFilesFromCloudinaryAsync([url || publicId]);
      res.json({ success: true, message: "File removal initiated on Cloudinary." });
    } catch (error: any) {
      console.error("deleteFile error:", error?.message);
      res.status(500).json({ error: "Failed to delete file from Cloudinary." });
    }
  }

  static async getAllAdmins(req: AuthRequest, res: Response): Promise<void> {
    try {
      const requestingAdminId = req.user?.userId;
      if (!requestingAdminId) { res.status(401).json({ error: "Unauthorized" }); return; }
      const admins = await AdminService.getAllAdmins(requestingAdminId);
      res.json({ admins });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch admins." });
    }
  }

  static async createAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const admin = await AdminService.createAdmin(req.body);
      res.status(201).json({ admin, message: "Admin created successfully." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create admin." });
    }
  }

  static async updateAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const requestingAdminId = req.user?.userId || "";
      const admin = await AdminService.updateAdmin(id, req.body, requestingAdminId);
      res.json({ admin, message: "Admin updated successfully." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update admin." });
    }
  }

  static async deleteAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const requestingAdminId = req.user?.userId || "";
      await AdminService.deleteAdmin(id, requestingAdminId);
      res.json({ success: true, message: "Admin deleted successfully." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete admin." });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const result = await AdminService.updateProfile(adminUserId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update admin profile." });
    }
  }
}
