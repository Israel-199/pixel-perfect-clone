import { Request, Response } from "express";
import { BookService } from "../services/bookService";
import jsonwebtoken from "jsonwebtoken";
import { cloudinary, parseCloudinaryUrl } from "../config/cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";

export class BookController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers["authorization"] || (req.headers["x-auth-token"] ? `Bearer ${req.headers["x-auth-token"]}` : null);
      let currentUserId: string | null = null;
      let isAdmin = false;

      if (authHeader) {
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        try {
          const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: string; role?: string };
          currentUserId = decoded.userId;
          isAdmin = decoded.role === "ADMIN";
        } catch (e) {}
      }

      // Safe query extraction using res.locals / local variables (Express 5 compatible)
      const query = (res.locals?.normalizedQuery || res.locals?.query || req.query || {}) as Record<string, any>;
      const mediaType = typeof query.mediaType === "string" ? query.mediaType : undefined;
      const search =
        typeof query.search === "string"
          ? query.search
          : typeof query.q === "string"
          ? query.q
          : undefined;

      const books = await BookService.getAllBooks(currentUserId, { mediaType, search }, isAdmin);
      res.json({ books });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch books." });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const authHeader = req.headers["authorization"] || (req.headers["x-auth-token"] ? `Bearer ${req.headers["x-auth-token"]}` : null);
      let currentUserId: string | null = null;
      let isAdmin = false;

      if (authHeader) {
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        try {
          const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: string; role?: string };
          currentUserId = decoded.userId;
          isAdmin = decoded.role === "ADMIN";
        } catch (e) {}
      }

      const book = await BookService.getBookById(id, currentUserId, isAdmin);
      res.json({ book });
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Book not found." });
    }
  }

  static async proxyPdf(req: Request, res: Response): Promise<void> {
    try {
      const rawUrl = (req.query.url as string) || "";
      if (!rawUrl) {
        res.status(400).json({ error: "Missing url parameter." });
        return;
      }

      let fetchUrl = rawUrl;
      // If Cloudinary URL, use private_download_url with authenticated signature
      if (rawUrl.includes("cloudinary.com")) {
        const parsed = parseCloudinaryUrl(rawUrl);
        if (parsed) {
          fetchUrl = cloudinary.utils.private_download_url(parsed.publicId, "", {
            resource_type: parsed.resourceType || "raw",
            type: "upload",
          });
        }
      }

      const upstream = await fetch(fetchUrl);
      if (!upstream.ok) {
        res.status(upstream.status).json({ error: `Upstream fetch failed: ${upstream.status}` });
        return;
      }

      const contentType = upstream.headers.get("content-type") || "application/pdf";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");

      const arrayBuffer = await upstream.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("proxyPdf error:", error);
      res.status(500).json({ error: error?.message || "Failed to proxy PDF." });
    }
  }
}
