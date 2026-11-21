"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupVideoController = void 0;
const popupVideoService_1 = require("../services/popupVideoService");
class PopupVideoController {
    /**
     * Public: returns currently active popup video
     */
    static async getPublic(req, res) {
        try {
            const popup = await popupVideoService_1.PopupVideoService.getPublicPopupVideo();
            res.json({ popup });
        }
        catch (error) {
            console.error("[PopupVideoController.getPublic] Error:", error);
            res.status(500).json({ error: "Failed to fetch popup video." });
        }
    }
    /**
     * Admin: returns the popup video configuration
     */
    static async getAdmin(req, res) {
        try {
            const popup = await popupVideoService_1.PopupVideoService.getAdminPopupVideo();
            res.json({ popup });
        }
        catch (error) {
            console.error("[PopupVideoController.getAdmin] Error:", error);
            res.status(500).json({ error: "Failed to fetch popup video configuration." });
        }
    }
    /**
     * Admin: updates the popup video configuration
     */
    static async updateAdmin(req, res) {
        try {
            const { title, description, videoUrl, thumbnailUrl, ctaText, ctaLink, isActive, autoPlay } = req.body || {};
            const popup = await popupVideoService_1.PopupVideoService.updatePopupVideo({
                title,
                description,
                videoUrl,
                thumbnailUrl,
                ctaText,
                ctaLink,
                isActive,
                autoPlay,
            });
            res.json({
                success: true,
                message: "Popup video configuration saved successfully.",
                popup,
            });
        }
        catch (error) {
            console.error("[PopupVideoController.updateAdmin] Error:", error);
            res.status(500).json({ error: "Failed to update popup video configuration." });
        }
    }
}
exports.PopupVideoController = PopupVideoController;
