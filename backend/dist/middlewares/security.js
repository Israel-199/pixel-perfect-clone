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
exports.normalizeQueryParams = normalizeQueryParams;
exports.getNormalizedQuery = getNormalizedQuery;
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
/** Global: 3000 req / 15 min — supports high-concurrency traffic without starving shared IPs */
exports.globalRateLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 3000,
    hardBlockMs: 0,
}).middleware();
/** Auth: 150 req / 15 min — allows multiple users on the same network to log in concurrently */
exports.authRateLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 150,
    hardBlockMs: 0,
    message: "Too many authentication attempts from this network. Please wait a moment before trying again.",
}).middleware();
/** Password reset: 25 req / 1 hour */
exports.passwordResetLimiter = new RateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 25,
    hardBlockMs: 0,
    message: "Too many password reset requests. Try again after 1 hour.",
}).middleware();
/** Admin API: 1500 req / 15 min */
exports.adminRateLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 1500,
}).middleware();
const speedStore = new Map();
/** High-throughput pass-through: avoids artificial setTimeout lag for concurrent users */
const speedLimiter = (_req, _res, next) => {
    next();
};
exports.speedLimiter = speedLimiter;
function normalizeQueryParams(raw) {
    const normalized = { ...raw };
    // Pagination normalization
    if (raw.page !== undefined) {
        const p = parseInt(String(raw.page), 10);
        normalized.page = !isNaN(p) && p > 0 ? p : 1;
    }
    if (raw.limit !== undefined) {
        const l = parseInt(String(raw.limit), 10);
        normalized.limit = !isNaN(l) && l > 0 ? Math.min(l, 100) : 20;
    }
    if (normalized.page && normalized.limit) {
        normalized.skip = (normalized.page - 1) * normalized.limit;
    }
    // Sorting normalization
    if (raw.sort !== undefined && typeof raw.sort === "string") {
        normalized.sort = raw.sort.trim();
    }
    if (raw.order !== undefined && typeof raw.order === "string") {
        const o = raw.order.trim().toLowerCase();
        normalized.order = o === "asc" ? "asc" : "desc";
    }
    // Search query normalization
    if (raw.search !== undefined && typeof raw.search === "string") {
        normalized.search = raw.search.trim();
    }
    else if (raw.q !== undefined && typeof raw.q === "string") {
        normalized.search = raw.q.trim();
    }
    // Filter & status normalization
    if (raw.filter !== undefined && typeof raw.filter === "string") {
        normalized.filter = raw.filter.trim();
    }
    if (raw.status !== undefined && typeof raw.status === "string") {
        normalized.status = raw.status.trim().toUpperCase();
    }
    if (raw.mediaType !== undefined && typeof raw.mediaType === "string") {
        normalized.mediaType = raw.mediaType.trim().toUpperCase();
    }
    return normalized;
}
/**
 * Express 5 safe query helper:
 * Express 5 defines req.query as a getter with no setter.
 * This helper retrieves normalized query parameters from res.locals,
 * falling back to req.query safely without mutating it.
 */
function getNormalizedQuery(req, res) {
    if (res?.locals?.normalizedQuery) {
        return res.locals.normalizedQuery;
    }
    if (res?.locals?.query) {
        return res.locals.query;
    }
    return normalizeQueryParams((req.query || {}));
}
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
const sanitizeInputs = (req, res, next) => {
    if (req.body)
        req.body = sanitizeValue(req.body);
    if (req.params && typeof req.params === "object") {
        for (const key of Object.keys(req.params)) {
            req.params[key] = sanitizeValue(req.params[key]);
        }
    }
    // Express 5: req.query is a getter only. Never assign directly to req.query.
    // Store sanitized query in res.locals for downstream middleware and controllers.
    const currentQuery = (res.locals?.query || req.query || {});
    const sanitized = sanitizeValue(currentQuery);
    res.locals.query = sanitized;
    res.locals.normalizedQuery = normalizeQueryParams(sanitized);
    next();
};
exports.sanitizeInputs = sanitizeInputs;
// ─── 4. PARAMETER POLLUTION PROTECTION ───────────────────────────────────────
const preventParamPollution = (req, res, next) => {
    // Express 5: req.query is a getter only. Never assign directly to req.query.
    // Resolve array pollution and store normalized query in res.locals.
    const rawQuery = (req.query || {});
    const cleaned = {};
    for (const [key, val] of Object.entries(rawQuery)) {
        cleaned[key] = Array.isArray(val)
            ? val[val.length - 1]
            : val;
    }
    res.locals.query = cleaned;
    res.locals.normalizedQuery = normalizeQueryParams(cleaned);
    next();
};
exports.preventParamPollution = preventParamPollution;
// ─── 5. PATH TRAVERSAL PROTECTION ───────────────────────────────────────────
const blockPathTraversal = (req, res, next) => {
    const suspicious = /\.\.(\/|\\)/;
    const queryToCheck = res.locals?.query || req.query || {};
    if (suspicious.test(req.url) ||
        suspicious.test(JSON.stringify(queryToCheck))) {
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
    const queryToCheck = res.locals?.query || req.query;
    if (checkObj(req.body) ||
        checkObj(queryToCheck) ||
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
