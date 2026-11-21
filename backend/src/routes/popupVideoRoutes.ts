import { Router } from "express";
import { PopupVideoController } from "../controllers/popupVideoController";

const router = Router();

// Public route to fetch current active popup video
router.get("/", PopupVideoController.getPublic);

export default router;
