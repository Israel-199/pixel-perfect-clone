import { prisma } from "../config/prisma";

export class RequestService {
  static async createRequest(userId: string, bookId: string, paymentProofUrl?: string) {
    if (!bookId) {
      throw new Error("Book ID is required.");
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new Error("Book not found.");
    }

    const existing = await prisma.purchaseRequest.findFirst({
      where: { userId, bookId },
    });

    if (existing) {
      return { request: existing, message: "Request already exists." };
    }

    const newRequest = await prisma.purchaseRequest.create({
      data: {
        userId,
        bookId,
        status: "PENDING",
        paymentProofUrl: paymentProofUrl || null,
      },
      include: { book: true },
    });

    return { request: newRequest, message: "Access request submitted successfully." };
  }

  static async getUserRequests(userId: string, statusFilter?: string) {
    const where: any = { userId };
    if (statusFilter && ["PENDING", "PERMITTED", "REJECTED"].includes(statusFilter)) {
      where.status = statusFilter;
    }

    const requests = await prisma.purchaseRequest.findMany({
      where,
      include: { book: true },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((r) => {
      const isPermitted = r.status === "PERMITTED";
      return {
        id: r.id,
        status: r.status,
        createdAt: r.createdAt,
        book: {
          id: r.book.id,
          title: r.book.title,
          author: r.book.author || "RABBI",
          description: r.book.description,
          price: r.book.price,
          coverUrl: r.book.coverUrl,
          mediaType: r.book.mediaType || "BOOK",
          sampleContent: r.book.sampleContent,
          fullContent: isPermitted ? r.book.fullContent : null,
          videoUrl: isPermitted ? r.book.videoUrl : null,
          audioUrl: isPermitted ? r.book.audioUrl : null,
        },
      };
    });
  }
}
