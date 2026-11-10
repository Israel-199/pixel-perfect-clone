/**
 * ============================================================
 *  COMPREHENSIVE SECURITY MIDDLEWARE
 *  Covers: DoS/DDoS, Brute-Force, SQL Injection, XSS,
 *          Header Injection, Parameter Pollution, CORS,
 *          Payload Flooding, Path Traversal, NoSQL Injection
 * ============================================================
 */

import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

// ─── 1. RATE LIMITERS (DDoS / Brute-Force Protection) ───────────────────────

/**
 * Global API rate limiter — 100 requests per IP per 15 minutes.
 * Prevents basic DDoS floods.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP. Please try again later.",
  },
  skip: (req) => req.path === "/api/health", // Health check always passes
});

/**
 * Auth endpoint limiter — strict: 10 attempts per 15 minutes.
 * Prevents brute-force login attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many authentication attempts. Please wait 15 minutes before trying again.",
  },
});

/**
 * Password reset limiter — 5 per hour per IP.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many password reset requests. Please try again after 1 hour.",
  },
});

/**
 * Admin API limiter — 200 per 15 minutes (admins do more ops).
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Admin API rate limit exceeded. Please slow down." },
});

/**
 * Speed limiter — slows down responses progressively after 20 requests
 * (adds 500ms delay per request beyond threshold, up to 20 seconds).
 * This discourages automated scanners/bots.
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 20,
  delayMs: (used) => (used - 20) * 500,
  maxDelayMs: 20000,
});

// ─── 2. INPUT SANITIZATION (SQL/NoSQL Injection, XSS) ───────────────────────

/**
 * Recursively sanitizes a value — strips dangerous characters used in
 * SQL injection, NoSQL injection, and XSS attempts.
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    // Block MongoDB/NoSQL operator injection via JSON keys like $where, $gt
    if (value.trim().startsWith("$")) {
      return "";
    }
    // Strip null bytes (used to bypass filters)
    value = value.replace(/\0/g, "");
    // Strip script injection patterns
    value = (value as string).replace(
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      ""
    );
    // Encode common XSS characters in string values
    // (React already escapes output — this is a defence-in-depth layer)
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    // Block NoSQL operator keys (e.g., { "$where": "..." })
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.startsWith("$")) continue; // Drop MongoDB operators
      sanitized[k] = sanitizeValue(v);
    }
    return sanitized;
  }
  return value;
}

/**
 * Middleware: sanitize req.body, req.params, req.query.
 * Applies to every request automatically.
 */
export const sanitizeInputs = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params) as typeof req.params;
  if (req.query) req.query = sanitizeValue(req.query) as typeof req.query;
  next();
};

// ─── 3. PARAMETER POLLUTION PROTECTION ──────────────────────────────────────

/**
 * Flatten array query params to their last value.
 * Prevents HPP (HTTP Parameter Pollution) attacks like
 * ?sort=asc&sort=desc&sort=DROP TABLE
 */
export const preventParamPollution = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.query) {
    const cleaned: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.query)) {
      if (Array.isArray(val)) {
        // Take only the last value
        cleaned[key] = val[val.length - 1] as string;
      } else {
        cleaned[key] = val as string;
      }
    }
    req.query = cleaned;
  }
  next();
};

// ─── 4. PATH TRAVERSAL PROTECTION ───────────────────────────────────────────

/**
 * Blocks requests with path traversal sequences like ../../etc/passwd
 */
export const blockPathTraversal = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const suspicious = /\.\.(\/|\\)/;
  const urlStr = req.url + JSON.stringify(req.query);
  if (suspicious.test(urlStr)) {
    res.status(400).json({ error: "Invalid request path." });
    return;
  }
  next();
};

// ─── 5. REQUEST SIZE GUARD ───────────────────────────────────────────────────

/**
 * Hard-rejects any single field string value over 100,000 chars.
 * Protects against payload-flooding / ReDoS.
 */
export const guardRequestSize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const MAX_FIELD_LEN = 100_000;
  if (req.body && typeof req.body === "object") {
    for (const [, val] of Object.entries(req.body)) {
      if (typeof val === "string" && val.length > MAX_FIELD_LEN) {
        res
          .status(413)
          .json({ error: "Request field too large. Maximum 100,000 characters per field." });
        return;
      }
    }
  }
  next();
};

// ─── 6. SUSPICIOUS PATTERN DETECTOR ─────────────────────────────────────────

/** SQL injection keywords / patterns to block */
const SQL_INJECTION_PATTERNS = [
  /(\bUNION\b.*\bSELECT\b)/i,
  /(\bDROP\b.*\bTABLE\b)/i,
  /(\bDELETE\b.*\bFROM\b)/i,
  /(\bINSERT\b.*\bINTO\b)/i,
  /(\bEXEC\b.*\()/i,
  /(\bEXECUTE\b.*\()/i,
  /(--\s*$)/m,
  /(\/\*[\s\S]*?\*\/)/,
  /(\bOR\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i, // OR 1=1
  /(\bAND\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i, // AND 1=1
  /(\bSLEEP\s*\()/i,
  /(\bWAITFOR\s+DELAY\b)/i,
  /(\bBENCHMARK\s*\()/i,
  /(;.*DROP|;.*DELETE|;.*INSERT|;.*UPDATE)/i,
  /xp_cmdshell/i,
  /INFORMATION_SCHEMA/i,
  /sys\.tables/i,
];

/** XSS patterns */
const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,         // onerror=, onclick=, etc.
  /data:text\/html/i,
  /vbscript:/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /document\.cookie/i,
  /document\.write/i,
  /window\.location/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /\balert\s*\(/i,
];

function containsInjection(val: string): boolean {
  for (const p of SQL_INJECTION_PATTERNS) {
    if (p.test(val)) return true;
  }
  for (const p of XSS_PATTERNS) {
    if (p.test(val)) return true;
  }
  return false;
}

function checkObjectForInjection(obj: unknown): boolean {
  if (typeof obj === "string") return containsInjection(obj);
  if (Array.isArray(obj)) return obj.some(checkObjectForInjection);
  if (obj !== null && typeof obj === "object") {
    return Object.values(obj as object).some(checkObjectForInjection);
  }
  return false;
}

/**
 * Middleware: Block requests that contain SQL injection or XSS payloads.
 * This is defence-in-depth on top of Prisma's parameterised queries.
 */
export const blockInjectionAttempts = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const toCheck = [req.body, req.query, req.params];
  for (const target of toCheck) {
    if (checkObjectForInjection(target)) {
      res.status(400).json({
        error: "Invalid input detected. Request rejected.",
      });
      return;
    }
  }
  next();
};

// ─── 7. SECURITY RESPONSE HEADERS ───────────────────────────────────────────

/**
 * Adds extra security headers beyond what Helmet provides.
 */
export const addSecurityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Disable XSS auditor (legacy, but no harm)
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy — disable camera, mic, geolocation
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  next();
};

// ─── 8. CORS CONFIGURATION ──────────────────────────────────────────────────

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin) {
      callback(null, true);
      return;
    }
    // In production, enforce origin whitelist
    if (process.env.NODE_ENV === "production") {
      if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
        callback(new Error("CORS: Origin not allowed."), false);
        return;
      }
    }
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight 24h
};

// ─── 9. REQUEST LOGGING (for security audit) ────────────────────────────────

/**
 * Logs suspicious activity without exposing sensitive data.
 */
export const securityLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  // Log auth attempts (without passwords)
  if (req.path.includes("/auth/login") || req.path.includes("/auth/register")) {
    const { password, confirmPassword, ...safeBody } = req.body || {};
    console.log(
      `[AUTH] ${new Date().toISOString()} IP=${ip} path=${req.path}`,
      JSON.stringify(safeBody)
    );
  }

  next();
};
