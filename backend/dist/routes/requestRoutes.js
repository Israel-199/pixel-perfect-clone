"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestController_1 = require("../controllers/requestController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticateToken, requestController_1.RequestController.create);
router.get("/my", authMiddleware_1.authenticateToken, requestController_1.RequestController.getMyRequests);
exports.default = router;
