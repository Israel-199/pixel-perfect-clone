import { prisma } from "../config/prisma";

export class BookmarkService {
  /**
   * Get bookmark for a specific user and book
   */
  static async getBookmark(userId: string, bookId: string) {
    return prisma.bookmark.findUnique({
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
  static async setBookmark(userId: string, bookId: string, page: number) {
    if (page < 1) page = 1;

    return prisma.bookmark.upsert({
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
  static async removeBookmark(userId: string, bookId: string) {
    return prisma.bookmark.deleteMany({
      where: {
        userId,
        bookId,
      },
    });
  }
}
