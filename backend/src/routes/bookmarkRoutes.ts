import { Router } from "express";
import { BookmarkController } from "../controllers/bookmarkController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// All bookmark operations require authentication
router.get("/:bookId", authenticateToken, BookmarkController.get);
router.post("/:bookId", authenticateToken, BookmarkController.set);
router.delete("/:bookId", authenticateToken, BookmarkController.remove);

export default router;
