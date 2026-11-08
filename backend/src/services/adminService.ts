import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AdminService {
  static async getAllRequests() {
    const requests = await prisma.purchaseRequest.findMany({
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true } },
        book: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            price: true,
            mediaType: true,
            requests: {
              where: { status: "PERMITTED" },
              select: { id: true, userId: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((req) => ({
      ...req,
      book: req.book
        ? {
            ...req.book,
            approvedBuyersCount: req.book.requests?.length || 0,
          }
        : null,
    }));
  }

  static async getContentsWithStats() {
    const books = await prisma.book.findMany({
      include: {
        requests: {
          include: {
            user: { select: { id: true, fullName: true, phone: true, email: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return books.map((book) => {
      const approvedRequests = book.requests.filter((r) => r.status === "PERMITTED");
      const pendingRequests = book.requests.filter((r) => r.status === "PENDING");
      const rejectedRequests = book.requests.filter((r) => r.status === "REJECTED");

      const buyers = approvedRequests.map((r) => ({
        requestId: r.id,
        userId: r.user.id,
        fullName: r.user.fullName || "ስም አልተገለጸም",
        email: r.user.email,
        phone: r.user.phone || "-",
        approvedAt: r.updatedAt,
        paymentProofUrl: r.paymentProofUrl,
      }));

      return {
        id: book.id,
        title: book.title,
        author: book.author || "RABBI",
        description: book.description,
        price: book.price,
        coverUrl: book.coverUrl,
        mediaType: book.mediaType || "BOOK",
        sampleContent: book.sampleContent,
        fullContent: book.fullContent,
        videoUrl: book.videoUrl,
        audioUrl: book.audioUrl,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
        approvedCount: approvedRequests.length,
        pendingCount: pendingRequests.length,
        rejectedCount: rejectedRequests.length,
        totalRevenue: approvedRequests.length * (book.price || 0),
        buyers,
      };
    });
  }

  static async getDashboardStats() {
    const allRequests = await prisma.purchaseRequest.findMany({
      include: {
        book: { select: { id: true, title: true, price: true, coverUrl: true, mediaType: true } },
      },
    });

    const approvedRequests = allRequests.filter((r) => r.status === "PERMITTED");
    const pendingRequests = allRequests.filter((r) => r.status === "PENDING");
    const rejectedRequests = allRequests.filter((r) => r.status === "REJECTED");

    const totalRevenue = approvedRequests.reduce((sum, r) => sum + (r.book?.price || 0), 0);
    const uniqueBuyerIds = new Set(approvedRequests.map((r) => r.userId));

    // Per book statistics
    const bookStatsMap: Record<
      string,
      {
        id: string;
        title: string;
        price: number;
        coverUrl: string;
        mediaType: string;
        approvedCount: number;
        revenue: number;
      }
    > = {};

    for (const req of approvedRequests) {
      if (!req.book) continue;
      if (!bookStatsMap[req.book.id]) {
        bookStatsMap[req.book.id] = {
          id: req.book.id,
          title: req.book.title,
          price: req.book.price,
          coverUrl: req.book.coverUrl,
          mediaType: req.book.mediaType || "BOOK",
          approvedCount: 0,
          revenue: 0,
        };
      }
      bookStatsMap[req.book.id].approvedCount += 1;
      bookStatsMap[req.book.id].revenue += req.book.price || 0;
    }

    const topSellingBooks = Object.values(bookStatsMap).sort(
      (a, b) => b.approvedCount - a.approvedCount
    );

    const totalBooks = await prisma.book.count();
    const totalUsers = await prisma.user.count();

    return {
      totalApprovedSales: approvedRequests.length,
      totalPendingRequests: pendingRequests.length,
      totalRejectedRequests: rejectedRequests.length,
      totalRevenue,
      totalUniqueBuyers: uniqueBuyerIds.size,
      totalBooks,
      totalUsers,
      topSellingBooks,
    };
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

    const validMediaTypes = ["BOOK", "VIDEO", "AUDIO", "IMAGE", "COURSE", "ARTICLE", "PRAYER"];
    const mediaType = (data.mediaType || "BOOK").toUpperCase();
    if (!validMediaTypes.includes(mediaType)) {
      throw new Error("የተሳሳተ የይዘት ዓይነት (Invalid content/media type).");
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

  static async updateProfile(
    adminUserId: string,
    data: {
      email?: string;
      password?: string;
      currentPassword?: string;
      fullName?: string;
      phone?: string;
    }
  ) {
    const adminUser = await prisma.user.findUnique({ where: { id: adminUserId } });
    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("የአስተዳዳሪ ተጠቃሚ አልተገኘም (Admin user not found).");
    }

    const updateData: any = {};

    if (data.fullName && data.fullName.trim()) {
      updateData.fullName = data.fullName.trim();
    }

    if (data.phone && data.phone.trim()) {
      updateData.phone = data.phone.trim();
    }

    // Email update
    if (data.email && data.email.trim()) {
      const cleanEmail = data.email.toLowerCase().trim();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        throw new Error("ትክክለኛ የኢሜይል አድራሻ ያስገቡ (Valid email is required).");
      }
      if (cleanEmail !== adminUser.email) {
        const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existing) {
          throw new Error("ይህ የኢሜይል አድራሻ አስቀድሞ በሌላ ተጠቃሚ ተመዝግቧል (Email already in use).");
        }
        updateData.email = cleanEmail;
      }
    }

    // Password update
    if (data.password && data.password.trim()) {
      if (data.password.length < 6) {
        throw new Error("አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት (Password must be at least 6 characters).");
      }

      if (data.currentPassword) {
        const isValid = await bcrypt.compare(data.currentPassword, adminUser.password);
        if (!isValid) {
          throw new Error("ያሁኑ የይለፍ ቃል ልክ አይደለም (Current password is incorrect).");
        }
      }

      updateData.password = await bcrypt.hash(data.password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: adminUserId },
      data: updateData,
    });

    const token = jsonwebtoken.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
      },
      token,
      message: "የአስተዳዳሪ ፕሮፋይል በተሳካ ሁኔታ ተሻሽሏል (Admin profile updated successfully).",
    };
  }
}
