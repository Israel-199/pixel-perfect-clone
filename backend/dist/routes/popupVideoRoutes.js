"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const popupVideoController_1 = require("../controllers/popupVideoController");
const router = (0, express_1.Router)();
// Public route to fetch current active popup video
router.get("/", popupVideoController_1.PopupVideoController.getPublic);
exports.default = router;
