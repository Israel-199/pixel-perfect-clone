import { Request, Response } from "express";
import { BookService } from "../services/bookService";
import jsonwebtoken from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";

export class BookController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers["authorization"];
      let currentUserId: string | null = null;

      if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: string };
          currentUserId = decoded.userId;
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

      const books = await BookService.getAllBooks(currentUserId, { mediaType, search });
      res.json({ books });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch books." });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const authHeader = req.headers["authorization"];
      let currentUserId: string | null = null;

      if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: string };
          currentUserId = decoded.userId;
        } catch (e) {}
      }

      const book = await BookService.getBookById(id, currentUserId);
      res.json({ book });
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Book not found." });
    }
  }
}
