"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
const requestService_1 = require("../services/requestService");
class RequestController {
    static async create(req, res) {
        try {
            const { bookId, paymentProofUrl } = req.body;
            const userId = req.user.userId;
            const result = await requestService_1.RequestService.createRequest(userId, bookId, paymentProofUrl);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Failed to create request." });
        }
    }
    static async getMyRequests(req, res) {
        try {
            const userId = req.user.userId;
            const query = (res.locals?.normalizedQuery || res.locals?.query || req.query || {});
            const status = typeof query.status === "string" ? query.status : undefined;
            const requests = await requestService_1.RequestService.getUserRequests(userId, status);
            res.json({ requests });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch requests." });
        }
    }
}
exports.RequestController = RequestController;
