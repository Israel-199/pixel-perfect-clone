"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivatePrayerController = void 0;
const privatePrayerService_1 = require("../services/privatePrayerService");
class PrivatePrayerController {
    // Public submission of private prayers
    static async submitPrayer(req, res) {
        try {
            const { title, description, submittedBy, contactInfo } = req.body;
            if (!title || !description) {
                return res.status(400).json({ error: "ርዕስ እና የጸሎት ዝርዝር አስፈላጊ ናቸው (Title and description are required)" });
            }
            const prayer = await privatePrayerService_1.PrivatePrayerService.createPrayer({
                title,
                description,
                submittedBy,
                contactInfo,
            });
            res.status(201).json({
                message: "የግል ጸሎትዎ በምስጢር ደርሷል",
                prayer: { id: prayer.id, createdAt: prayer.createdAt },
            });
        }
        catch (error) {
            console.error("Submit Private Prayer Error:", error);
            res.status(500).json({ error: error.message || "Failed to submit prayer" });
        }
    }
    // Admin: View all submitted private prayers
    static async getAllPrayers(req, res) {
        try {
            const query = (res.locals?.normalizedQuery || res.locals?.query || req.query || {});
            const filter = typeof query.filter === "string" ? query.filter : undefined;
            const prayers = await privatePrayerService_1.PrivatePrayerService.getAllPrayers(filter);
            res.json({ prayers });
        }
        catch (error) {
            console.error("Get Private Prayers Error:", error);
            res.status(500).json({ error: error.message || "Failed to fetch private prayers" });
        }
    }
    // Admin: Toggle prayed/reviewed status
    static async toggleStatus(req, res) {
        try {
            const id = String(req.params.id);
            const updated = await privatePrayerService_1.PrivatePrayerService.togglePrayedStatus(id);
            res.json({ message: "Status updated successfully", prayer: updated });
        }
        catch (error) {
            console.error("Toggle Status Error:", error);
            res.status(500).json({ error: error.message || "Failed to update status" });
        }
    }
    // Admin: Delete prayer
    static async deletePrayer(req, res) {
        try {
            const id = String(req.params.id);
            await privatePrayerService_1.PrivatePrayerService.deletePrayer(id);
            res.json({ message: "Private prayer deleted successfully" });
        }
        catch (error) {
            console.error("Delete Prayer Error:", error);
            res.status(500).json({ error: error.message || "Failed to delete prayer" });
        }
    }
}
exports.PrivatePrayerController = PrivatePrayerController;
