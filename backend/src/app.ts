import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import requestRoutes from "./routes/requestRoutes";
import adminRoutes from "./routes/adminRoutes";
import privatePrayerRoutes from "./routes/privatePrayerRoutes";
import { prisma } from "./config/prisma";
import {
  globalRateLimiter,
  authRateLimiter,
  adminRateLimiter,
  speedLimiter,
  sanitizeInputs,
  preventParamPollution,
  blockPathTraversal,
  blockInjectionAttempts,
  guardRequestSize,
  addSecurityHeaders,
  corsOptions,
  securityLogger,
} from "./middlewares/security";

dotenv.config();

export const app = express();

// ─── 1. CORS — strict origin control ─────────────────────────────────────────
app.use(cors(corsOptions));

// ─── 2. HELMET — secure HTTP headers (CSP, HSTS, etc.) ───────────────────────
app.use(
  helmet({
    // Content-Security-Policy: only allow our own domain + trusted CDNs
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // allow inline Tailwind
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
        mediaSrc: ["'self'", "https://res.cloudinary.com", "https://www.youtube.com", "https://www.soundhelix.com"],
        frameSrc: ["'self'", "https://www.youtube.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    // Strict-Transport-Security — force HTTPS for 1 year
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    // Prevent MIME type sniffing
    noSniff: true,
    // Prevent clickjacking
    frameguard: { action: "deny" },
    // Hide X-Powered-By: Express
    hidePoweredBy: true,
    // Block cross-origin reads
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Referrer policy
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ─── 3. EXTRA SECURITY HEADERS ────────────────────────────────────────────────
app.use(addSecurityHeaders);

// ─── 4. REQUEST SIZE LIMITS (DoS / payload flooding) ─────────────────────────
// Tight limit on JSON body — 10MB max (down from 50MB which was dangerously large)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── 5. GLOBAL RATE LIMITER + SPEED LIMITER (DDoS) ───────────────────────────
app.use(globalRateLimiter);
app.use(speedLimiter);

// ─── 6. PATH TRAVERSAL BLOCKER ───────────────────────────────────────────────
app.use(blockPathTraversal);

// ─── 7. PARAMETER POLLUTION PROTECTION ───────────────────────────────────────
app.use(preventParamPollution);

// ─── 8. INPUT SANITIZATION (NoSQL/XSS) ───────────────────────────────────────
app.use(sanitizeInputs);

// ─── 9. INJECTION PATTERN BLOCKER (SQL / XSS signatures) ─────────────────────
app.use(blockInjectionAttempts);

// ─── 10. PAYLOAD SIZE GUARD per field ────────────────────────────────────────
app.use(guardRequestSize);

// ─── 11. SECURITY LOGGER ─────────────────────────────────────────────────────
app.use(securityLogger);

// ─── ROUTE MOUNTS ─────────────────────────────────────────────────────────────
// Auth routes get the strict brute-force rate limiter
app.use("/api/auth", authRateLimiter, authRoutes);

// Admin routes get admin-specific rate limiter
app.use("/api/admin", adminRateLimiter, adminRoutes);

// Public routes
app.use("/api/books", bookRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/private-prayers", privatePrayerRoutes);

// ─── HEALTHCHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Resource not found." });
});

// ─── GLOBAL ERROR HANDLER (hides stack traces in production) ──────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const isProduction = process.env.NODE_ENV === "production";
  console.error("[ERROR]", err);
  res.status(err.status || 500).json({
    error: isProduction ? "An internal server error occurred." : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// ─── SEED ─────────────────────────────────────────────────────────────────────
export async function seedInitialBooks() {
  try {
    const count = await prisma.book.count();
    if (count === 0) {
      console.log("Seeding initial spiritual books into database...");

      const booksToSeed = [
        {
          title: "ከእምነት ወደ እምነት",
          author: "መጋቢ ካስሁብ መሰሎን",
          description:
            "ከእምነት ወደ እምነት የሚያደርስ መንፈሳዊ ጉዞ እና የእግዚአብሔር ቃል ጥናት መመሪያ።",
          price: 250,
          coverUrl:
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
          mediaType: "BOOK",
          sampleContent: `ክፍል 1: የእምነት መሠረት\n\nእምነት ተስፋ ስለምናደርገው ነገር የሚያስረዳ። (ዕብራውያን 11:1)`,
          fullContent: `ክፍል 1: የእምነት መሠረት\n\nሙሉ ይዘት...`,
        },
        {
          title: "የጸሎት ሕይወትና ምስጢር",
          author: "RABBI Ministry",
          description: "ከእግዚአብሔር ጋር ጥልቅ ህብረት ለማድረግ የሚረዳ የጸሎት ትምህርት።",
          price: 200,
          coverUrl:
            "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&auto=format&fit=crop",
          mediaType: "BOOK",
          sampleContent: `የጸሎት መግቢያ፡\nጸሎት የመንፈስ ቅዱስ እስትንፋስ ነው።`,
          fullContent: `ሙሉ ይዘት...`,
        },
        {
          title: "የእሁድ ትምህርት - ቪዲዮና ድምፅ",
          author: "RABBI Academy",
          description: "የእሁድ መንፈሳዊ ትምህርት ሙሉ ቪዲዮ እና ድምፅ ክምችት።",
          price: 300,
          coverUrl:
            "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop",
          mediaType: "VIDEO",
          sampleContent: "ሙሉ ቪዲዮ ለማየት ግዢ ያረጋግጡ።",
          fullContent: "እንኳን ደስ አለዎት! ሙሉ ቪዲዮ ከታች ይመልከቱ።",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        },
      ];

      for (const b of booksToSeed) {
        await prisma.book.create({ data: b });
      }

      console.log("Initial books seeded successfully!");
    }
  } catch (e) {
    console.error("Seeding Error:", e);
  }
}
