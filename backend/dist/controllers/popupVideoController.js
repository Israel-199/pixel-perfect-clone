"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupVideoController = void 0;
const popupVideoService_1 = require("../services/popupVideoService");
class PopupVideoController {
    /**
     * Public: returns all active popup videos
     */
    static async getPublic(req, res) {
        try {
            const videos = await popupVideoService_1.PopupVideoService.getPublicPopupVideos();
            res.json({
                videos,
                popup: videos.length > 0 ? videos[0] : null,
            });
        }
        catch (error) {
            console.error("[PopupVideoController.getPublic] Error:", error);
            res.status(500).json({ error: "Failed to fetch popup videos." });
        }
    }
    /**
     * Admin: returns all popup videos
     */
    static async getAllAdmin(req, res) {
        try {
            const videos = await popupVideoService_1.PopupVideoService.getAllAdminPopupVideos();
            res.json({
                videos,
                popup: videos.length > 0 ? videos[0] : null,
            });
        }
        catch (error) {
            console.error("[PopupVideoController.getAllAdmin] Error:", error);
            res.status(500).json({ error: "Failed to fetch popup videos." });
        }
    }
    /**
     * Admin: creates a new popup video
     */
    static async createAdmin(req, res) {
        try {
            const { title, description, videoUrl, thumbnailUrl, ctaText, ctaLink, isActive, autoPlay, order } = req.body || {};
            if (!videoUrl || !videoUrl.trim()) {
                res.status(400).json({ error: "Video URL is required." });
                return;
            }
            const video = await popupVideoService_1.PopupVideoService.createPopupVideo({
                title,
                description,
                videoUrl,
                thumbnailUrl,
                ctaText,
                ctaLink,
                isActive,
                autoPlay,
                order,
            });
            res.status(201).json({
                success: true,
                message: "Popup video created successfully.",
                video,
            });
        }
        catch (error) {
            console.error("[PopupVideoController.createAdmin] Error:", error);
            res.status(500).json({ error: "Failed to create popup video." });
        }
    }
    /**
     * Admin: updates an existing popup video
     */
    static async updateAdmin(req, res) {
        try {
            const id = req.params.id;
            const { title, description, videoUrl, thumbnailUrl, ctaText, ctaLink, isActive, autoPlay, order } = req.body || {};
            if (!id) {
                // Fallback for single/default update
                const videos = await popupVideoService_1.PopupVideoService.getAllAdminPopupVideos();
                if (videos.length > 0) {
                    const updated = await popupVideoService_1.PopupVideoService.updatePopupVideo(videos[0].id, {
                        title,
                        description,
                        videoUrl,
                        thumbnailUrl,
                        ctaText,
                        ctaLink,
                        isActive,
                        autoPlay,
                        order,
                    });
                    res.json({
                        success: true,
                        message: "Popup video updated successfully.",
                        video: updated,
                        popup: updated,
                    });
                    return;
                }
                else {
                    // If none exist, create one
                    const created = await popupVideoService_1.PopupVideoService.createPopupVideo({
                        title,
                        description,
                        videoUrl,
                        thumbnailUrl,
                        ctaText,
                        ctaLink,
                        isActive,
                        autoPlay,
                        order,
                    });
                    res.json({
                        success: true,
                        message: "Popup video created successfully.",
                        video: created,
                        popup: created,
                    });
                    return;
                }
            }
            const updated = await popupVideoService_1.PopupVideoService.updatePopupVideo(id, {
                title,
                description,
                videoUrl,
                thumbnailUrl,
                ctaText,
                ctaLink,
                isActive,
                autoPlay,
                order,
            });
            res.json({
                success: true,
                message: "Popup video updated successfully.",
                video: updated,
            });
        }
        catch (error) {
            console.error("[PopupVideoController.updateAdmin] Error:", error);
            res.status(500).json({ error: "Failed to update popup video." });
        }
    }
    /**
     * Admin: deletes a popup video
     */
    static async deleteAdmin(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ error: "Video ID is required." });
                return;
            }
            await popupVideoService_1.PopupVideoService.deletePopupVideo(id);
            res.json({
                success: true,
                message: "Popup video deleted successfully.",
            });
        }
        catch (error) {
            console.error("[PopupVideoController.deleteAdmin] Error:", error);
            res.status(500).json({ error: "Failed to delete popup video." });
        }
    }
    /**
     * Admin: reorders popup videos
     */
    static async reorderAdmin(req, res) {
        try {
            const { orderedIds } = req.body || {};
            if (!Array.isArray(orderedIds)) {
                res.status(400).json({ error: "orderedIds array is required." });
                return;
            }
            await popupVideoService_1.PopupVideoService.reorderPopupVideos(orderedIds);
            res.json({
                success: true,
                message: "Videos reordered successfully.",
            });
        }
        catch (error) {
            console.error("[PopupVideoController.reorderAdmin] Error:", error);
            res.status(500).json({ error: "Failed to reorder videos." });
        }
    }
}
exports.PopupVideoController = PopupVideoController;
