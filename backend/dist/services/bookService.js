"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const prisma_1 = require("../config/prisma");
class BookService {
    static async getAllBooks(currentUserId) {
        const books = await prisma_1.prisma.book.findMany({
            orderBy: { createdAt: "desc" },
        });
        let userRequests = {};
        if (currentUserId) {
            const requests = await prisma_1.prisma.purchaseRequest.findMany({
                where: { userId: currentUserId },
            });
            requests.forEach((r) => {
                userRequests[r.bookId] = r.status;
            });
        }
        return books.map((book) => {
            const status = userRequests[book.id] || "NONE";
            const isPermitted = status === "PERMITTED";
            return {
                id: book.id,
                title: book.title,
                author: book.author || "RABBI",
                description: book.description,
                price: book.price,
                coverUrl: book.coverUrl,
                mediaType: book.mediaType || "BOOK",
                sampleContent: book.sampleContent,
                fullContent: isPermitted ? book.fullContent : null,
                videoUrl: isPermitted ? book.videoUrl : null,
                audioUrl: isPermitted ? book.audioUrl : null,
                requestStatus: status,
                isPermitted,
                createdAt: book.createdAt,
            };
        });
    }
    static async getBookById(id, currentUserId) {
        const book = await prisma_1.prisma.book.findUnique({ where: { id } });
        if (!book) {
            throw new Error("Book not found.");
        }
        let requestStatus = "NONE";
        if (currentUserId) {
            const reqRecord = await prisma_1.prisma.purchaseRequest.findFirst({
                where: { userId: currentUserId, bookId: id },
            });
            if (reqRecord) {
                requestStatus = reqRecord.status;
            }
        }
        const isPermitted = requestStatus === "PERMITTED";
        return {
            id: book.id,
            title: book.title,
            author: book.author || "RABBI",
            description: book.description,
            price: book.price,
            coverUrl: book.coverUrl,
            mediaType: book.mediaType || "BOOK",
            sampleContent: book.sampleContent,
            fullContent: isPermitted ? book.fullContent : null,
            videoUrl: isPermitted ? book.videoUrl : null,
            audioUrl: isPermitted ? book.audioUrl : null,
            requestStatus,
            isPermitted,
        };
    }
}
exports.BookService = BookService;
