"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupVideoService = void 0;
const prisma_1 = require("../config/prisma");
const cloudinary_1 = require("../config/cloudinary");
class PopupVideoService {
    /**
     * Retrieves all active popup videos for public display on the website,
     * sorted by order ascending and createdAt ascending.
     */
    static async getPublicPopupVideos() {
        try {
            const videos = await prisma_1.prisma.popupVideo.findMany({
                where: {
                    isActive: true,
                    videoUrl: { not: "" },
                },
                orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            });
            return videos;
        }
        catch (error) {
            console.error("[PopupVideoService.getPublicPopupVideos] Error:", error);
            return [];
        }
    }
    /**
     * Retrieves all popup videos (active and inactive) for admin management.
     */
    static async getAllAdminPopupVideos() {
        const videos = await prisma_1.prisma.popupVideo.findMany({
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        });
        return videos;
    }
    /**
     * Creates a new popup video.
     */
    static async createPopupVideo(input) {
        // Count existing to assign next order
        const count = await prisma_1.prisma.popupVideo.count();
        const created = await prisma_1.prisma.popupVideo.create({
            data: {
                title: input.title?.trim() || "About RABBI Digital",
                description: input.description?.trim() || "",
                videoUrl: input.videoUrl?.trim() || "",
                thumbnailUrl: input.thumbnailUrl?.trim() || null,
                ctaText: input.ctaText?.trim() || "ስለ እኛ ተጨማሪ እወቅ",
                ctaLink: input.ctaLink?.trim() || "/about",
                isActive: input.isActive !== undefined ? input.isActive : true,
                autoPlay: input.autoPlay !== undefined ? input.autoPlay : true,
                order: input.order !== undefined ? input.order : count,
            },
        });
        return created;
    }
    /**
     * Updates an existing popup video by ID.
     */
    static async updatePopupVideo(id, input) {
        const data = {};
        if (input.title !== undefined)
            data.title = String(input.title).trim();
        if (input.description !== undefined)
            data.description = String(input.description).trim();
        if (input.videoUrl !== undefined)
            data.videoUrl = String(input.videoUrl).trim();
        if (input.thumbnailUrl !== undefined)
            data.thumbnailUrl = input.thumbnailUrl ? String(input.thumbnailUrl).trim() : null;
        if (input.ctaText !== undefined)
            data.ctaText = input.ctaText ? String(input.ctaText).trim() : null;
        if (input.ctaLink !== undefined)
            data.ctaLink = input.ctaLink ? String(input.ctaLink).trim() : null;
        if (input.isActive !== undefined)
            data.isActive = Boolean(input.isActive);
        if (input.autoPlay !== undefined)
            data.autoPlay = Boolean(input.autoPlay);
        if (input.order !== undefined)
            data.order = Number(input.order);
        const updated = await prisma_1.prisma.popupVideo.update({
            where: { id },
            data,
        });
        return updated;
    }
    /**
     * Deletes a popup video by ID and cleans up Cloudinary assets in background.
     */
    static async deletePopupVideo(id) {
        const existing = await prisma_1.prisma.popupVideo.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new Error("Popup video not found");
        }
        if (existing.videoUrl || existing.thumbnailUrl) {
            (0, cloudinary_1.deleteFilesFromCloudinaryAsync)([existing.videoUrl, existing.thumbnailUrl]);
        }
        await prisma_1.prisma.popupVideo.delete({
            where: { id },
        });
        return { success: true };
    }
    /**
     * Reorders multiple popup videos.
     */
    static async reorderPopupVideos(orderedIds) {
        await prisma_1.prisma.$transaction(orderedIds.map((id, index) => prisma_1.prisma.popupVideo.update({
            where: { id },
            data: { order: index },
        })));
        return { success: true };
    }
}
exports.PopupVideoService = PopupVideoService;
