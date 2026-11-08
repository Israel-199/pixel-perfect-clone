"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const privatePrayerController_1 = require("../controllers/privatePrayerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public: Submit prayer request privately
router.post("/", privatePrayerController_1.PrivatePrayerController.submitPrayer);
// Admin-only: View, toggle status, and delete
router.get("/admin/all", authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, privatePrayerController_1.PrivatePrayerController.getAllPrayers);
router.put("/admin/:id/toggle", authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, privatePrayerController_1.PrivatePrayerController.toggleStatus);
router.delete("/admin/:id", authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, privatePrayerController_1.PrivatePrayerController.deletePrayer);
exports.default = router;
