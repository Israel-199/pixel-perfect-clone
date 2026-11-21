"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupVideoService = void 0;
const prisma_1 = require("../config/prisma");
class PopupVideoService {
    static DEFAULT_ID = "default";
    /**
     * Retrieves the active popup video for public display on the website.
     * If not active or no video URL is configured, returns null.
     */
    static async getPublicPopupVideo() {
        try {
            const popup = await prisma_1.prisma.popupVideo.findUnique({
                where: { id: this.DEFAULT_ID },
            });
            if (!popup || !popup.isActive || !popup.videoUrl?.trim()) {
                return null;
            }
            return popup;
        }
        catch (error) {
            console.error("[PopupVideoService.getPublicPopupVideo] Error:", error);
            return null;
        }
    }
    /**
     * Retrieves the popup video config for admin management.
     * If none exists yet, returns a default template.
     */
    static async getAdminPopupVideo() {
        let popup = await prisma_1.prisma.popupVideo.findUnique({
            where: { id: this.DEFAULT_ID },
        });
        if (!popup) {
            // Seed initial default record
            popup = await prisma_1.prisma.popupVideo.create({
                data: {
                    id: this.DEFAULT_ID,
                    title: "About RABBI Digital",
                    description: "የእኛን ዲጂታል ቤተ-መጻሕፍት እና መንፈሳዊ አገልግሎት በአጭሩ ይመልከቱ",
                    videoUrl: "",
                    thumbnailUrl: "",
                    ctaText: "ስለ እኛ ተጨማሪ እወቅ",
                    ctaLink: "/about",
                    isActive: false,
                    autoPlay: true,
                },
            });
        }
        return popup;
    }
    /**
     * Updates or creates the popup video settings.
     */
    static async updatePopupVideo(input) {
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
        const updated = await prisma_1.prisma.popupVideo.upsert({
            where: { id: this.DEFAULT_ID },
            update: data,
            create: {
                id: this.DEFAULT_ID,
                title: data.title || "About RABBI Digital",
                description: data.description || "የእኛን ዲጂታል ቤተ-መጻሕፍት እና መንፈሳዊ አገልግሎት በአጭሩ ይመልከቱ",
                videoUrl: data.videoUrl || "",
                thumbnailUrl: data.thumbnailUrl || null,
                ctaText: data.ctaText || "ስለ እኛ ተጨማሪ እወቅ",
                ctaLink: data.ctaLink || "/about",
                isActive: data.isActive !== undefined ? data.isActive : true,
                autoPlay: data.autoPlay !== undefined ? data.autoPlay : true,
            },
        });
        return updated;
    }
}
exports.PopupVideoService = PopupVideoService;
