"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkService = void 0;
const prisma_1 = require("../config/prisma");
class BookmarkService {
    /**
     * Get bookmark for a specific user and book
     */
    static async getBookmark(userId, bookId) {
        return prisma_1.prisma.bookmark.findUnique({
            where: {
                userId_bookId: {
                    userId,
                    bookId,
                },
            },
        });
    }
    /**
     * Upsert a bookmark (create or update marked page)
     */
    static async setBookmark(userId, bookId, page) {
        if (page < 1)
            page = 1;
        return prisma_1.prisma.bookmark.upsert({
            where: {
                userId_bookId: {
                    userId,
                    bookId,
                },
            },
            update: {
                page,
            },
            create: {
                userId,
                bookId,
                page,
            },
        });
    }
    /**
     * Remove a bookmark
     */
    static async removeBookmark(userId, bookId) {
        return prisma_1.prisma.bookmark.deleteMany({
            where: {
                userId,
                bookId,
            },
        });
    }
}
exports.BookmarkService = BookmarkService;
