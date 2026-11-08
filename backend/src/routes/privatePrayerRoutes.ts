import { Router } from "express";
import { PrivatePrayerController } from "../controllers/privatePrayerController";
import { authenticateToken, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public: Submit prayer request privately
router.post("/", PrivatePrayerController.submitPrayer);

// Admin-only: View, toggle status, and delete
router.get("/admin/all", authenticateToken, requireAdmin, PrivatePrayerController.getAllPrayers);
router.put("/admin/:id/toggle", authenticateToken, requireAdmin, PrivatePrayerController.toggleStatus);
router.delete("/admin/:id", authenticateToken, requireAdmin, PrivatePrayerController.deletePrayer);

export default router;
