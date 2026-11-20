"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.seedInitialBooks = seedInitialBooks;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const requestRoutes_1 = __importDefault(require("./routes/requestRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const privatePrayerRoutes_1 = __importDefault(require("./routes/privatePrayerRoutes"));
const bookmarkRoutes_1 = __importDefault(require("./routes/bookmarkRoutes"));
const prisma_1 = require("./config/prisma");
const security_1 = require("./middlewares/security");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
// ─── 1. CORS ──────────────────────────────────────────────────────────────────
exports.app.use((0, cors_1.default)(security_1.corsOptions));
// ─── 2. SECURITY HEADERS (CSP, HSTS, X-Frame-Options, etc.) ──────────────────
exports.app.use(security_1.addSecurityHeaders);
// ─── 3. BODY PARSING — tight limits (10MB max, was 50MB — DoS protection) ────
exports.app.use(express_1.default.json({ limit: "10mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// ─── 4. GLOBAL RATE LIMITER + SPEED LIMITER (DDoS) ───────────────────────────
exports.app.use(security_1.globalRateLimiter);
exports.app.use(security_1.speedLimiter);
// ─── 5. PATH TRAVERSAL BLOCKER ───────────────────────────────────────────────
exports.app.use(security_1.blockPathTraversal);
// ─── 6. PARAMETER POLLUTION PROTECTION ───────────────────────────────────────
exports.app.use(security_1.preventParamPollution);
// ─── 7. INPUT SANITIZATION (NoSQL/XSS) ───────────────────────────────────────
exports.app.use(security_1.sanitizeInputs);
// ─── 8. INJECTION PATTERN BLOCKER (SQL / XSS signatures) ─────────────────────
exports.app.use(security_1.blockInjectionAttempts);
// ─── 9. PAYLOAD SIZE GUARD per field ─────────────────────────────────────────
exports.app.use(security_1.guardRequestSize);
// ─── 10. SECURITY LOGGER ─────────────────────────────────────────────────────
exports.app.use(security_1.securityLogger);
// ─── ROUTES ──────────────────────────────────────────────────────────────────
// Auth: strict brute-force rate limiter applied
exports.app.use("/api/auth/register", security_1.authRateLimiter);
exports.app.use("/api/auth/login", security_1.authRateLimiter);
exports.app.use("/api/auth/forgot-password", security_1.passwordResetLimiter);
exports.app.use("/api/auth/reset-password", security_1.passwordResetLimiter);
exports.app.use("/api/auth", authRoutes_1.default);
// Admin: extra rate limiter
exports.app.use("/api/admin", security_1.adminRateLimiter, adminRoutes_1.default);
// Public routes
exports.app.use("/api/books", bookRoutes_1.default);
exports.app.use("/api/requests", requestRoutes_1.default);
exports.app.use("/api/private-prayers", privatePrayerRoutes_1.default);
exports.app.use("/api/bookmarks", bookmarkRoutes_1.default);
// ─── HEALTHCHECK ─────────────────────────────────────────────────────────────
exports.app.get("/api/health", (_req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
exports.app.use((_req, res) => {
    res.status(404).json({ error: "Resource not found." });
});
// ─── GLOBAL ERROR HANDLER (hides stack traces in production) ─────────────────
exports.app.use((err, _req, res, _next) => {
    const isProd = process.env.NODE_ENV === "production";
    console.error("[ERROR]", isProd ? err.message : err);
    res.status(err.status || 500).json({
        error: isProd
            ? "An internal server error occurred."
            : err.message || "Internal server error",
    });
});
// ─── DATABASE SEED ────────────────────────────────────────────────────────────
async function seedInitialBooks() {
    try {
        const count = await prisma_1.prisma.book.count();
        if (count === 0) {
            console.log("Seeding initial spiritual books into database...");
            const booksToSeed = [
                {
                    title: "ከእምነት ወደ እምነት",
                    author: "መጋቢ ካስሁብ መሰሎን",
                    description: "ከእምነት ወደ እምነት የሚያደርስ መንፈሳዊ ጉዞ እና የእግዚአብሔር ቃል ጥናት መመሪያ።",
                    price: 250,
                    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
                    mediaType: "BOOK",
                    sampleContent: "ክፍል 1: የእምነት መሠረት\n\nእምነት ተስፋ ስለምናደርገው ነገር የሚያስረዳ። (ዕብራውያን 11:1)",
                    fullContent: "ሙሉ ይዘት...",
                },
                {
                    title: "የጸሎት ሕይወትና ምስጢር",
                    author: "RABBI Ministry",
                    description: "ከእግዚአብሔር ጋር ጥልቅ ህብረት ለማድረግ የሚረዳ የጸሎት ትምህርት።",
                    price: 200,
                    coverUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&auto=format&fit=crop",
                    mediaType: "BOOK",
                    sampleContent: "የጸሎት መግቢያ፡\nጸሎት የመንፈስ ቅዱስ እስትንፋስ ነው።",
                    fullContent: "ሙሉ ይዘት...",
                },
                {
                    title: "የእሁድ ትምህርት - ቪዲዮና ድምፅ",
                    author: "RABBI Academy",
                    description: "የእሁድ መንፈሳዊ ትምህርት ሙሉ ቪዲዮ እና ድምፅ ክምችት።",
                    price: 300,
                    coverUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop",
                    mediaType: "VIDEO",
                    sampleContent: "ሙሉ ቪዲዮ ለማየት ግዢ ያረጋግጡ።",
                    fullContent: "እንኳን ደስ አለዎት! ሙሉ ቪዲዮ ከታች ይመልከቱ።",
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                },
            ];
            for (const b of booksToSeed) {
                await prisma_1.prisma.book.create({ data: b });
            }
            console.log("Initial books seeded successfully!");
        }
    }
    catch (e) {
        console.error("Seeding Error:", e);
    }
}
