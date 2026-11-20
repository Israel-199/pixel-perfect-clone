"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkController = void 0;
const bookmarkService_1 = require("../services/bookmarkService");
class BookmarkController {
    static async get(req, res) {
        try {
            const userId = req.user?.userId;
            const rawBookId = req.params.bookId;
            const bookId = Array.isArray(rawBookId) ? rawBookId[0] : rawBookId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            if (!bookId) {
                res.status(400).json({ error: "bookId is required" });
                return;
            }
            const bookmark = await bookmarkService_1.BookmarkService.getBookmark(userId, bookId);
            res.json({ bookmark });
        }
        catch (err) {
            res.status(500).json({ error: err.message || "Failed to retrieve bookmark" });
        }
    }
    static async set(req, res) {
        try {
            const userId = req.user?.userId;
            const rawBookId = req.params.bookId;
            const bookId = Array.isArray(rawBookId) ? rawBookId[0] : rawBookId;
            const { page } = req.body;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            if (!bookId) {
                res.status(400).json({ error: "bookId is required" });
                return;
            }
            const pageNum = parseInt(page, 10);
            if (isNaN(pageNum) || pageNum < 1) {
                res.status(400).json({ error: "Invalid page number" });
                return;
            }
            const bookmark = await bookmarkService_1.BookmarkService.setBookmark(userId, bookId, pageNum);
            res.json({ message: "Bookmark saved", bookmark });
        }
        catch (err) {
            res.status(500).json({ error: err.message || "Failed to save bookmark" });
        }
    }
    static async remove(req, res) {
        try {
            const userId = req.user?.userId;
            const rawBookId = req.params.bookId;
            const bookId = Array.isArray(rawBookId) ? rawBookId[0] : rawBookId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            if (!bookId) {
                res.status(400).json({ error: "bookId is required" });
                return;
            }
            await bookmarkService_1.BookmarkService.removeBookmark(userId, bookId);
            res.json({ message: "Bookmark removed" });
        }
        catch (err) {
            res.status(500).json({ error: err.message || "Failed to remove bookmark" });
        }
    }
}
exports.BookmarkController = BookmarkController;
