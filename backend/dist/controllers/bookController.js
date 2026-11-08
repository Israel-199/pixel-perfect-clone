"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookController = void 0;
const bookService_1 = require("../services/bookService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";
class BookController {
    static async getAll(req, res) {
        try {
            const authHeader = req.headers["authorization"];
            let currentUserId = null;
            if (authHeader) {
                const token = authHeader.split(" ")[1];
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    currentUserId = decoded.userId;
                }
                catch (e) { }
            }
            const books = await bookService_1.BookService.getAllBooks(currentUserId);
            res.json({ books });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch books." });
        }
    }
    static async getById(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const authHeader = req.headers["authorization"];
            let currentUserId = null;
            if (authHeader) {
                const token = authHeader.split(" ")[1];
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    currentUserId = decoded.userId;
                }
                catch (e) { }
            }
            const book = await bookService_1.BookService.getBookById(id, currentUserId);
            res.json({ book });
        }
        catch (error) {
            res.status(404).json({ error: error.message || "Book not found." });
        }
    }
}
exports.BookController = BookController;
