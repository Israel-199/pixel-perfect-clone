"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const prisma_1 = require("../config/prisma");
class BookService {
    static async getAllBooks(currentUserId, options, isAdmin = false) {
        const where = {};
        if (options?.mediaType && options.mediaType !== "ALL") {
            where.mediaType = options.mediaType;
        }
        if (options?.search && options.search.trim()) {
            const q = options.search.trim();
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { author: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
            ];
        }
        const [books, requestsArr] = await Promise.all([
            prisma_1.prisma.book.findMany({
                where: Object.keys(where).length > 0 ? where : undefined,
                orderBy: { createdAt: "desc" },
            }),
            currentUserId
                ? prisma_1.prisma.purchaseRequest.findMany({ where: { userId: currentUserId } })
                : Promise.resolve([]),
        ]);
        const userRequests = {};
        requestsArr.forEach((r) => {
            userRequests[r.bookId] = r.status;
        });
        return books.map((book) => {
            const status = userRequests[book.id] || "NONE";
            const isPermitted = isAdmin ||
                status === "PERMITTED" ||
                book.price === 0 ||
                book.mediaType === "ARTICLE" ||
                book.mediaType === "PRAYER";
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
                cbeAccount: book.cbeAccount,
                abyssiniaAccount: book.abyssiniaAccount,
                telebirrAccount: book.telebirrAccount,
                accountHolder: book.accountHolder,
                requestStatus: status,
                isPermitted,
                createdAt: book.createdAt,
            };
        });
    }
    static async getBookById(id, currentUserId, isAdmin = false) {
        const [book, reqRecord] = await Promise.all([
            prisma_1.prisma.book.findUnique({ where: { id } }),
            currentUserId
                ? prisma_1.prisma.purchaseRequest.findFirst({ where: { userId: currentUserId, bookId: id } })
                : Promise.resolve(null),
        ]);
        if (!book) {
            throw new Error("Book not found.");
        }
        let requestStatus = "NONE";
        if (reqRecord) {
            requestStatus = reqRecord.status;
        }
        const isPermitted = isAdmin ||
            requestStatus === "PERMITTED" ||
            book.price === 0 ||
            book.mediaType === "ARTICLE" ||
            book.mediaType === "PRAYER";
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
            cbeAccount: book.cbeAccount,
            abyssiniaAccount: book.abyssiniaAccount,
            telebirrAccount: book.telebirrAccount,
            accountHolder: book.accountHolder,
            requestStatus,
            isPermitted,
        };
    }
}
exports.BookService = BookService;
