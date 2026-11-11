import { prisma } from "../config/prisma";

export class BookService {
  static async getAllBooks(
    currentUserId?: string | null,
    options?: { mediaType?: string; search?: string }
  ) {
    const where: any = {};
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

    const books = await prisma.book.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
    });

    let userRequests: Record<string, string> = {};
    if (currentUserId) {
      const requests = await prisma.purchaseRequest.findMany({
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

  static async getBookById(id: string, currentUserId?: string | null) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new Error("Book not found.");
    }

    let requestStatus = "NONE";
    if (currentUserId) {
      const reqRecord = await prisma.purchaseRequest.findFirst({
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
