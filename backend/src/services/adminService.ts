import { prisma } from "../config/prisma";

export class AdminService {
  static async getAllRequests() {
    return prisma.purchaseRequest.findMany({
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true } },
        book: { select: { id: true, title: true, coverUrl: true, price: true, mediaType: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateRequestStatus(id: string, status: "PENDING" | "PERMITTED" | "REJECTED") {
    if (!["PENDING", "PERMITTED", "REJECTED"].includes(status)) {
      throw new Error("Invalid status value.");
    }

    return prisma.purchaseRequest.update({
      where: { id },
      data: { status },
      include: { user: true, book: true },
    });
  }

  static async createBook(data: {
    title: string;
    author?: string;
    description?: string;
    price?: number | string;
    coverUrl: string;
    sampleContent?: string;
    fullContent?: string;
    videoUrl?: string;
    audioUrl?: string;
    mediaType?: string;
  }) {
    if (!data.title || !data.coverUrl) {
      throw new Error("Title and cover image URL are required.");
    }

    return prisma.book.create({
      data: {
        title: data.title,
        author: data.author || "RABBI",
        description: data.description || "",
        price: data.price ? parseFloat(data.price.toString()) : 0,
        coverUrl: data.coverUrl,
        sampleContent: data.sampleContent || "",
        fullContent: data.fullContent || "",
        videoUrl: data.videoUrl || null,
        audioUrl: data.audioUrl || null,
        mediaType: data.mediaType || "BOOK",
      },
    });
  }

  static async updateBook(
    id: string,
    data: {
      title?: string;
      author?: string;
      description?: string;
      price?: number | string;
      coverUrl?: string;
      sampleContent?: string;
      fullContent?: string;
      videoUrl?: string;
      audioUrl?: string;
      mediaType?: string;
    }
  ) {
    return prisma.book.update({
      where: { id },
      data: {
        title: data.title,
        author: data.author,
        description: data.description,
        price: data.price !== undefined ? parseFloat(data.price.toString()) : undefined,
        coverUrl: data.coverUrl,
        sampleContent: data.sampleContent,
        fullContent: data.fullContent,
        videoUrl: data.videoUrl,
        audioUrl: data.audioUrl,
        mediaType: data.mediaType,
      },
    });
  }

  static async deleteBook(id: string) {
    return prisma.book.delete({ where: { id } });
  }
}
