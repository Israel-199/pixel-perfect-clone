import { prisma } from "../config/prisma";

export class PrivatePrayerService {
  static async createPrayer(data: {
    title: string;
    description: string;
    submittedBy?: string;
    contactInfo?: string;
  }) {
    return await prisma.privatePrayer.create({
      data: {
        title: data.title,
        description: data.description,
        submittedBy: data.submittedBy || null,
        contactInfo: data.contactInfo || null,
      },
    });
  }

  static async getAllPrayers(filter?: string) {
    const where: any = {};
    if (filter === "prayed") where.isPrayed = true;
    if (filter === "unprayed") where.isPrayed = false;

    return await prisma.privatePrayer.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  static async togglePrayedStatus(id: string) {
    const existing = await prisma.privatePrayer.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new Error("Private prayer not found");
    }
    return await prisma.privatePrayer.update({
      where: { id },
      data: {
        isPrayed: !existing.isPrayed,
      },
    });
  }

  static async deletePrayer(id: string) {
    return await prisma.privatePrayer.delete({
      where: { id },
    });
  }
}
