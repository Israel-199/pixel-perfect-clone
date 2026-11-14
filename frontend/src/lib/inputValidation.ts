/**
 * Strict Input Validation Helpers:
 * 1. Name / Word inputs: Only letters/words and spaces allowed. Numbers CANNOT be typed or saved.
 * 2. Number inputs: Only digits (0-9) allowed. Nothing other than numbers can be typed or saved.
 * 3. Email inputs: Strict email regex. Only receives valid emails.
 */

// Matches letters in all scripts (Latin, Ge'ez / Amharic \u1200-\u137F) plus spaces, hyphens, and apostrophes
export const NAME_REGEX = /^[\p{L}\s\u1200-\u137F'\-.]+$/u;

// Strict RFC-compliant email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Digits only
export const DIGITS_REGEX = /^\d+$/;

/**
 * Filter handler for name inputs to block/strip any typed numbers immediately
 */
export function filterNameInput(value: string): string {
  // Strip digits 0-9 and Ge'ez numerals ፩-፱
  return value.replace(/[\d፩-፱]/g, "");
}

/**
 * Filter handler for pure number/digit inputs to block any non-digit character
 */
export function filterNumberInput(value: string, allowDecimal = false): string {
  if (allowDecimal) {
    // Keep digits and at most one decimal point
    const cleaned = value.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  }
  return value.replace(/\D/g, "");
}

/**
 * Filter handler for phone number (digits and optional leading +)
 */
export function filterPhoneInput(value: string): string {
  const hasPlus = value.startsWith("+");
  const digits = value.replace(/\D/g, "");
  return (hasPlus ? "+" : "") + digits;
}

/**
 * Validates a name. Returns error message or null if valid.
 */
export function validateName(name: string, fieldLabel = "ስም (Name)"): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return `${fieldLabel} ማስገባት አስፈላጊ ነው (${fieldLabel} is required).`;
  }
  if (/[\d፩-፱]/.test(trimmed)) {
    return `${fieldLabel} ፊደላትን ብቻ መያዝ አለበት፤ ቁጥር ማስቀመጥ አይቻልም (${fieldLabel} must only contain letters/words; numbers cannot be saved).`;
  }
  if (!NAME_REGEX.test(trimmed)) {
    return `${fieldLabel} ልክ ያልሆኑ ምልክቶችን ይዟል (${fieldLabel} contains invalid characters).`;
  }
  if (trimmed.length < 2) {
    return `${fieldLabel} ቢያንስ 2 ፊደላት መሆን አለበት (${fieldLabel} must be at least 2 characters).`;
  }
  return null;
}

/**
 * Validates a number. Returns error message or null if valid.
 */
export function validateNumber(
  value: string | number,
  fieldLabel = "ቁጥር (Number)",
  min = 0,
  max?: number
): string | null {
  const str = String(value).trim();
  if (!str) {
    return `${fieldLabel} ማስገባት አስፈላጊ ነው (${fieldLabel} is required).`;
  }
  if (!/^\d+(\.\d+)?$/.test(str)) {
    return `${fieldLabel} ቁጥር ብቻ መሆን አለበት (${fieldLabel} must contain only numbers).`;
  }
  const num = Number(str);
  if (isNaN(num) || num < min) {
    return `${fieldLabel} ከ ${min} ማነስ አይችልም (${fieldLabel} cannot be less than ${min}).`;
  }
  if (max !== undefined && num > max) {
    return `${fieldLabel} ከ ${max} መብለጥ አይችልም (${fieldLabel} cannot be greater than ${max}).`;
  }
  return null;
}

/**
 * Validates an email address. Returns error message or null if valid.
 */
export function validateEmail(email: string, fieldLabel = "ኢሜይል (Email)"): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return `${fieldLabel} ማስገባት አስፈላጊ ነው (${fieldLabel} is required).`;
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return `እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ (ለምሳሌ፡ user@example.com) (Please enter a valid email address).`;
  }
  return null;
}
