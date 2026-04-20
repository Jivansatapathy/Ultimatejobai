/**
 * Sanitization and Validation Utilities
 * Targets: XSS prevention, Oversized inputs, and data consistency.
 */

export const MAX_SMALL_TEXT = 255;
export const MAX_MEDIUM_TEXT = 1000;
export const MAX_LARGE_TEXT = 5000;

/**
 * Strips HTML tags and trims whitespace.
 */
export function sanitizeString(val: string, maxLength: number = MAX_SMALL_TEXT): string {
  if (typeof val !== 'string') return '';
  
  // Basic HTML strip
  const stripped = val.replace(/<[^>]*>?/gm, '');
  
  // Normalize whitespace and truncate
  return stripped.trim().slice(0, maxLength);
}

/**
 * Specialized sanitizer for multi-line content like summaries or descriptions.
 */
export function sanitizeContent(val: string, maxLength: number = MAX_LARGE_TEXT): string {
  if (typeof val !== 'string') return '';
  
  // Still strip HTML but allow more characters
  const stripped = val.replace(/<[^>]*>?/gm, '');
  return stripped.trim().slice(0, maxLength);
}

/**
 * Validates and cleans email addresses.
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  const clean = email.trim().toLowerCase().slice(0, 255);
  // Basic regex check - only return if it looks like an email or empty
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean) ? clean : '';
}

/**
 * Sanitizes URLs to prevent javascript: or malformed links.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const clean = url.trim().slice(0, 500);
  if (clean.toLowerCase().startsWith('javascript:')) return '';
  return clean;
}
