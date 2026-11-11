"use strict";
/**
 * ============================================================
 *  COMPREHENSIVE SECURITY MIDDLEWARE — Zero external deps
 *  Covers: DoS/DDoS, Brute-Force, SQL Injection, XSS,
 *          Header Injection, Parameter Pollution, CORS,
 *          Payload Flooding, Path Traversal, NoSQL Injection
 * ============================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = exports.corsOptions = exports.addSecurityHeaders = exports.blockInjectionAttempts = exports.guardRequestSize = exports.blockPathTraversal = exports.preventParamPollution = exports.sanitizeInputs = exports.speedLimiter = exports.adminRateLimiter = exports.passwordResetLimiter = exports.authRateLimiter = exports.globalRateLimiter = void 0;
class RateLimiter {
    store = new Map();
    windowMs;
    max;
    message;
    hardBlockMs; // extra cooldown after limit hit
    constructor(opts) {
        this.windowMs = opts.windowMs;
        this.max = opts.max;
        this.message =
            opts.message || "Too many requests. Please try again later.";
        this.hardBlockMs = opts.hardBlockMs ?? 0;
        // Cleanup old entries every minute
        setInterval(() => {
            const now = Date.now();
            for (const [key, bucket] of this.store.entries()) {
                if (now > bucket.resetAt + 60_000)
                    this.store.delete(key);
            }
        }, 60_000).unref();
    }
    middleware() {
        return (req, res, next) => {
            const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
                req.socket.remoteAddress ||
                "unknown";
            const key = `${ip}:${req.path}`;
            const now = Date.now();
            let bucket = this.store.get(key);
            // Check hard block first
            if (bucket?.blocked && bucket.blockedUntil && now < bucket.blockedUntil) {
                const retryAfter = Math.ceil((bucket.blockedUntil - now) / 1000);
                res.setHeader("Retry-After", String(retryAfter));
                res.setHeader("X-RateLimit-Limit", String(this.max));
                res.setHeader("X-RateLimit-Remaining", "0");
                res.status(429).json({ error: this.message });
                return;
            }
            // Reset window if expired
            if (!bucket || now > bucket.resetAt) {
                bucket = { count: 0, resetAt: now + this.windowMs };
                this.store.set(key, bucket);
            }
            bucket.count++;
            res.setHeader("X-RateLimit-Limit", String(this.max));
            res.setHeader("X-RateLimit-Remaining", String(Math.max(0, this.max - bucket.count)));
            res.setHeader("X-RateLimit-Reset", new Date(bucket.resetAt).toISOString());
            if (bucket.count > this.max) {
                bucket.blocked = true;
                bucket.blockedUntil = now + (this.hardBlockMs || this.windowMs);
                const retryAfter = Math.ceil(((bucket.blockedUntil ?? 0) - now) / 1000);
                res.setHeader("Retry-After", String(retryAfter));
                res.status(429).json({ error: this.message });
                return;
            }
            next();
        };
    }
}
// ─── INSTANTIATE RATE LIMITERS ───────────────────────────────────────────────
/** Global: 120 req / 15 min — covers all routes */
exports.globalRateLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 120,
    hardBlockMs: 5 * 60 * 1000, // 5 min hard block after exceeded
}).middleware();
/** Auth: 10 req / 15 min — login / register */
exports.authRateLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    hardBlockMs: 30 * 60 * 1000, // 30 min hard block after brute-force
    message: "Too many authentication attempts. Please wait before trying again.",
}).middleware();
/** Password reset: 5 req / 1 hour */
exports.passwordResetLimiter = new RateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    hardBlockMs: 60 * 60 * 1000,
    message: "Too many password reset requests. Try again after 1 hour.",
}).middleware();
/** Admin API: 300 req / 15 min */
exports.adminRateLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
}).middleware();
const speedStore = new Map();
/** Adds up to 10 s delay per request after 25 requests in 15 min */
const speedLimiter = (req, _res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "anon";
    const now = Date.now();
    let b = speedStore.get(ip);
    if (!b || now > b.resetAt) {
        b = { count: 0, resetAt: now + 15 * 60 * 1000 };
        speedStore.set(ip, b);
    }
    b.count++;
    const excess = Math.max(0, b.count - 25);
    const delay = Math.min(excess * 300, 10_000); // 300ms per extra req, cap 10s
    if (delay > 0) {
        setTimeout(() => {
            next();
        }, delay);
    }
    else {
        next();
    }
};
exports.speedLimiter = speedLimiter;
// ─── 3. INPUT SANITIZATION (SQL/NoSQL Injection, XSS) ───────────────────────
function sanitizeValue(value) {
    if (typeof value === "string") {
        if (value.trim().startsWith("$"))
            return ""; // Block NoSQL operators
        return value
            .replace(/\0/g, "") // null bytes
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ""); // script tags
    }
    if (Array.isArray(value))
        return value.map(sanitizeValue);
    if (value !== null && typeof value === "object") {
        const sanitized = {};
        for (const [k, v] of Object.entries(value)) {
            if (k.startsWith("$"))
                continue; // Drop MongoDB operator keys
            sanitized[k] = sanitizeValue(v);
        }
        return sanitized;
    }
    return value;
}
const sanitizeInputs = (req, _res, next) => {
    if (req.body)
        req.body = sanitizeValue(req.body);
    if (req.params)
        req.params = sanitizeValue(req.params);
    if (req.query)
        req.query = sanitizeValue(req.query);
    next();
};
exports.sanitizeInputs = sanitizeInputs;
// ─── 4. PARAMETER POLLUTION PROTECTION ───────────────────────────────────────
const preventParamPollution = (req, _res, next) => {
    if (req.query) {
        const cleaned = {};
        for (const [key, val] of Object.entries(req.query)) {
            cleaned[key] = Array.isArray(val)
                ? val[val.length - 1]
                : val;
        }
        req.query = cleaned;
    }
    next();
};
exports.preventParamPollution = preventParamPollution;
// ─── 5. PATH TRAVERSAL PROTECTION ───────────────────────────────────────────
const blockPathTraversal = (req, res, next) => {
    const suspicious = /\.\.(\/|\\)/;
    if (suspicious.test(req.url) ||
        suspicious.test(JSON.stringify(req.query))) {
        res.status(400).json({ error: "Invalid request path." });
        return;
    }
    next();
};
exports.blockPathTraversal = blockPathTraversal;
// ─── 6. PAYLOAD SIZE GUARD ───────────────────────────────────────────────────
const guardRequestSize = (req, res, next) => {
    const MAX = 100_000;
    if (req.body && typeof req.body === "object") {
        for (const val of Object.values(req.body)) {
            if (typeof val === "string" && val.length > MAX) {
                res
                    .status(413)
                    .json({ error: "Request field too large. Max 100,000 characters." });
                return;
            }
        }
    }
    next();
};
exports.guardRequestSize = guardRequestSize;
// ─── 7. SQL INJECTION + XSS PATTERN BLOCKER ─────────────────────────────────
const SQL_PATTERNS = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bEXEC\b.*\()/i,
    /(\bEXECUTE\b.*\()/i,
    /xp_cmdshell/i,
    /INFORMATION_SCHEMA/i,
    /(;.*DROP|;.*DELETE|;.*INSERT|;.*UPDATE)/i,
    /(\bSLEEP\s*\()/i,
    /(\bWAITFOR\s+DELAY\b)/i,
    /(\bBENCHMARK\s*\()/i,
    /(\bOR\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i,
    /(\bAND\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i,
    /(--\s*$)/m,
];
const XSS_PATTERNS = [
    /<script[\s>]/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /document\.cookie/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
];
function hasInjection(val) {
    for (const p of SQL_PATTERNS)
        if (p.test(val))
            return true;
    for (const p of XSS_PATTERNS)
        if (p.test(val))
            return true;
    return false;
}
function checkObj(obj) {
    if (typeof obj === "string")
        return hasInjection(obj);
    if (Array.isArray(obj))
        return obj.some(checkObj);
    if (obj !== null && typeof obj === "object")
        return Object.values(obj).some(checkObj);
    return false;
}
const blockInjectionAttempts = (req, res, next) => {
    if (checkObj(req.body) ||
        checkObj(req.query) ||
        checkObj(req.params)) {
        res.status(400).json({ error: "Invalid input detected. Request rejected." });
        return;
    }
    next();
};
exports.blockInjectionAttempts = blockInjectionAttempts;
// ─── 8. SECURITY HEADERS (manual Helmet equivalent) ─────────────────────────
const addSecurityHeaders = (_req, res, next) => {
    res.removeHeader("X-Powered-By");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("Content-Security-Policy", [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com",
        "media-src 'self' https://res.cloudinary.com https://www.youtube.com https://www.soundhelix.com",
        "frame-src 'self' https://www.youtube.com",
        "connect-src 'self'",
        "font-src 'self' https://fonts.gstatic.com",
        "object-src 'none'",
    ].join("; "));
    next();
};
exports.addSecurityHeaders = addSecurityHeaders;
// ─── 9. CORS OPTIONS ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
exports.corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        if (process.env.NODE_ENV === "production" && ALLOWED_ORIGINS.length > 0) {
            if (!ALLOWED_ORIGINS.includes(origin)) {
                callback(new Error("CORS: Origin not allowed."), false);
                return;
            }
        }
        callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
};
// ─── 10. SECURITY LOGGER ─────────────────────────────────────────────────────
const securityLogger = (req, _res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";
    if (req.path.includes("/auth/login") ||
        req.path.includes("/auth/register")) {
        const { password: _p, confirmPassword: _cp, ...safe } = req.body || {};
        console.log(`[SEC] ${new Date().toISOString()} ip=${ip} path=${req.path}`, JSON.stringify(safe));
    }
    next();
};
exports.securityLogger = securityLogger;
