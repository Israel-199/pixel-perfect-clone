/**
 * Input validation helpers — used by controllers to validate & sanitize
 * user-submitted data before it reaches the database.
 *
 * Uses pure TypeScript (no extra library) for portability.
 */

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s\-().]{7,20}$/;
const URL_RE = /^https?:\/\/.{3,}/i;
const ALPHANUM_RE = /^[\w\s\u1200-\u137F.,!?'"""''()\-:;@/+#&%\n]{1,5000}$/u;

export function validateEmail(email: unknown): string {
  if (!email || typeof email !== "string") throw new Error("Email is required.");
  const clean = email.trim().toLowerCase();
  if (clean.length > 254) throw new Error("Email address too long.");
  if (!EMAIL_RE.test(clean)) throw new Error("Invalid email address format.");
  return clean;
}

export function validatePassword(password: unknown, label = "Password"): string {
  if (!password || typeof password !== "string")
    throw new Error(`${label} is required.`);
  if (password.length < 6) throw new Error(`${label} must be at least 6 characters.`);
  if (password.length > 128) throw new Error(`${label} must be under 128 characters.`);
  return password;
}

export function validatePhone(phone: unknown): string {
  if (!phone || typeof phone !== "string") throw new Error("Phone number is required.");
  const clean = phone.trim();
  if (!PHONE_RE.test(clean)) throw new Error("Invalid phone number format.");
  return clean;
}

export function validateUrl(url: unknown, field = "URL"): string {
  if (!url || typeof url !== "string") return "";
  const clean = url.trim();
  if (clean === "") return "";
  if (!URL_RE.test(clean)) throw new Error(`${field} must be a valid HTTPS URL.`);
  if (clean.length > 2048) throw new Error(`${field} is too long.`);
  // Block file:// and data: schemes
  if (/^(file|data|ftp|blob):/i.test(clean))
    throw new Error(`${field} scheme not allowed.`);
  return clean;
}

export function validateString(
  val: unknown,
  field: string,
  { required = false, max = 5000, min = 0 } = {}
): string {
  if (!val || typeof val !== "string") {
    if (required) throw new Error(`${field} is required.`);
    return "";
  }
  const clean = val.trim();
  if (required && clean.length < 1) throw new Error(`${field} is required.`);
  if (clean.length < min) throw new Error(`${field} must be at least ${min} characters.`);
  if (clean.length > max) throw new Error(`${field} must be under ${max} characters.`);
  return clean;
}

export function validatePositiveNumber(val: unknown, field = "Number"): number {
  const n = Number(val);
  if (!isFinite(n) || n < 0) throw new Error(`${field} must be a non-negative number.`);
  if (n > 1_000_000) throw new Error(`${field} value is unreasonably large.`);
  return n;
}

export function validateId(id: unknown, field = "ID"): string {
  if (!id || typeof id !== "string") throw new Error(`${field} is required.`);
  const clean = id.trim();
  // IDs are typically cuid/uuid — alphanumeric + dashes, max 36 chars
  if (!/^[a-zA-Z0-9_\-]{1,64}$/.test(clean))
    throw new Error(`Invalid ${field} format.`);
  return clean;
}

/** Strip any HTML tags from a string — defence-in-depth for content fields */
export function stripHtml(val: string): string {
  return val.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}
