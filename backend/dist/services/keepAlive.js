"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKeepAlive = startKeepAlive;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const prisma_1 = require("../config/prisma");
/**
 * Self-ping mechanism to keep the server awake on free hosting services like Render.
 * Render free tier puts web services to sleep after 15 minutes of inbound network inactivity.
 * This service sends a GET request to /api/health every 10 minutes.
 */
function startKeepAlive() {
    const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes (keeps server & serverless DB warm)
    const rawUrl = process.env.RENDER_EXTERNAL_URL ||
        process.env.SERVER_URL ||
        process.env.BACKEND_URL ||
        `http://localhost:${process.env.PORT || 5000}`;
    const pingUrl = rawUrl.endsWith("/api/health")
        ? rawUrl
        : `${rawUrl.replace(/\/$/, "")}/api/health`;
    console.log(`[Keep-Alive] Initialized. Will ping ${pingUrl} every 10 minutes.`);
    const pingServer = async () => {
        // Keep Neon PostgreSQL connection pool and compute warm
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
        }
        catch (e) {
            console.warn("[Keep-Alive DB ping notice]:", e?.message);
        }
        try {
            const url = new URL(pingUrl);
            const protocol = url.protocol === "https:" ? https_1.default : http_1.default;
            const req = protocol.get(url.toString(), (res) => {
                console.log(`[Keep-Alive Ping] Status: ${res.statusCode} | Time: ${new Date().toISOString()}`);
            });
            req.on("error", (err) => {
                console.error(`[Keep-Alive Error] Failed to ping ${pingUrl}:`, err.message);
            });
            req.end();
        }
        catch (err) {
            console.error(`[Keep-Alive Error] Invalid URL (${pingUrl}):`, err.message);
        }
    };
    // Perform initial ping 30 seconds after server boot, then repeat every 10 minutes
    setTimeout(pingServer, 30000);
    setInterval(pingServer, PING_INTERVAL);
}
