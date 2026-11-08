"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminService_1 = require("../services/adminService");
const cloudinary_1 = require("../config/cloudinary");
class AdminController {
    static async getAllRequests(req, res) {
        try {
            const requests = await adminService_1.AdminService.getAllRequests();
            res.json({ requests });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch admin requests." });
        }
    }
    static async updateRequestStatus(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { status } = req.body;
            const updated = await adminService_1.AdminService.updateRequestStatus(id, status);
            res.json({ request: updated, message: `Request status updated to ${status}` });
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Failed to update status." });
        }
    }
    static async createBook(req, res) {
        try {
            const book = await adminService_1.AdminService.createBook(req.body);
            res.status(201).json({ book, message: "Book created successfully." });
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Failed to create book." });
        }
    }
    static async updateBook(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const book = await adminService_1.AdminService.updateBook(id, req.body);
            res.json({ book, message: "Book updated successfully." });
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Failed to update book." });
        }
    }
    static async deleteBook(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            await adminService_1.AdminService.deleteBook(id);
            res.json({ success: true, message: "Book deleted successfully." });
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Failed to delete book." });
        }
    }
    static async uploadFile(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ error: "No file uploaded." });
                return;
            }
            const resourceType = req.body.resourceType || "auto";
            const uploadStream = cloudinary_1.cloudinary.uploader.upload_stream({ folder: "rabbi_church_assets", resource_type: resourceType }, (error, result) => {
                if (error || !result) {
                    console.error("Cloudinary error:", error);
                    res.status(500).json({ error: "Cloudinary upload failed." });
                    return;
                }
                res.json({
                    url: result.secure_url,
                    public_id: result.public_id,
                    resource_type: result.resource_type,
                });
            });
            uploadStream.end(req.file.buffer);
        }
        catch (error) {
            res.status(500).json({ error: "File upload failed." });
        }
    }
    static async updateProfile(req, res) {
        try {
            const adminUserId = req.user?.userId;
            if (!adminUserId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const result = await adminService_1.AdminService.updateProfile(adminUserId, req.body);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Failed to update admin profile." });
        }
    }
}
exports.AdminController = AdminController;
