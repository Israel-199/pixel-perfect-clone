"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookmarkController_1 = require("../controllers/bookmarkController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All bookmark operations require authentication
router.get("/:bookId", authMiddleware_1.authenticateToken, bookmarkController_1.BookmarkController.get);
router.post("/:bookId", authMiddleware_1.authenticateToken, bookmarkController_1.BookmarkController.set);
router.delete("/:bookId", authMiddleware_1.authenticateToken, bookmarkController_1.BookmarkController.remove);
exports.default = router;
