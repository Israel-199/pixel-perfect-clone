"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivatePrayerService = void 0;
const prisma_1 = require("../config/prisma");
class PrivatePrayerService {
    static async createPrayer(data) {
        return await prisma_1.prisma.privatePrayer.create({
            data: {
                title: data.title,
                description: data.description,
                submittedBy: data.submittedBy || null,
                contactInfo: data.contactInfo || null,
            },
        });
    }
    static async getAllPrayers() {
        return await prisma_1.prisma.privatePrayer.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    static async togglePrayedStatus(id) {
        const existing = await prisma_1.prisma.privatePrayer.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new Error("Private prayer not found");
        }
        return await prisma_1.prisma.privatePrayer.update({
            where: { id },
            data: {
                isPrayed: !existing.isPrayed,
            },
        });
    }
    static async deletePrayer(id) {
        return await prisma_1.prisma.privatePrayer.delete({
            where: { id },
        });
    }
}
exports.PrivatePrayerService = PrivatePrayerService;
