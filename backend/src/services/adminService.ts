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
    if (!id || !id.trim()) {
      throw new Error("የጥያቄ መታወቂያ ተገቢ ነው (Request ID is required).");
    }

    if (!["PENDING", "PERMITTED", "REJECTED"].includes(status)) {
      throw new Error("የተሳሳተ የሁኔታ እሴት (Invalid status value).");
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
    if (!data.title || !data.title.trim()) {
      throw new Error("የመጽሐፉ ርዕስ ማስገባት ተገቢ ነው (Title is required).");
    }

    if (!data.coverUrl || !data.coverUrl.trim()) {
      throw new Error("የከቨር ፎቶ URL ማስገባት ተገቢ ነው (Cover image URL is required).");
    }

    const numPrice = data.price !== undefined ? parseFloat(data.price.toString()) : 0;
    if (isNaN(numPrice) || numPrice < 0) {
      throw new Error("ዋጋው ትክክለኛ አዎንታዊ ቁጥር መሆን አለበት (Price must be a valid positive number).");
    }

    const validMediaTypes = ["BOOK", "VIDEO", "AUDIO", "IMAGE"];
    const mediaType = (data.mediaType || "BOOK").toUpperCase();
    if (!validMediaTypes.includes(mediaType)) {
      throw new Error("የተሳሳተ የሜዲያ ዓይነት (Invalid media type).");
    }

    return prisma.book.create({
      data: {
        title: data.title.trim(),
        author: data.author ? data.author.trim() : "RABBI",
        description: data.description ? data.description.trim() : "",
        price: numPrice,
        coverUrl: data.coverUrl.trim(),
        sampleContent: data.sampleContent ? data.sampleContent.trim() : "",
        fullContent: data.fullContent ? data.fullContent.trim() : "",
        videoUrl: data.videoUrl ? data.videoUrl.trim() : null,
        audioUrl: data.audioUrl ? data.audioUrl.trim() : null,
        mediaType: mediaType,
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
    if (!id || !id.trim()) {
      throw new Error("የመጽሐፍ መታወቂያ ተገቢ ነው (Book ID is required).");
    }

    return prisma.book.update({
      where: { id },
      data: {
        title: data.title?.trim(),
        author: data.author?.trim(),
        description: data.description?.trim(),
        price: data.price !== undefined ? parseFloat(data.price.toString()) : undefined,
        coverUrl: data.coverUrl?.trim(),
        sampleContent: data.sampleContent?.trim(),
        fullContent: data.fullContent?.trim(),
        videoUrl: data.videoUrl?.trim(),
        audioUrl: data.audioUrl?.trim(),
        mediaType: data.mediaType?.toUpperCase(),
      },
    });
  }

  static async deleteBook(id: string) {
    if (!id || !id.trim()) {
      throw new Error("የመጽሐፍ መታወቂያ ተገቢ ነው (Book ID is required).");
    }

    return prisma.book.delete({ where: { id } });
  }
}
