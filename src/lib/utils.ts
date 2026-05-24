// ============================================================
// URL Utilities — Validation, Slugs, Formatting
// ============================================================
import { customAlphabet } from 'nanoid';

// Safe alphabet — no ambiguous chars (0/O, 1/l/I)
const nanoid = customAlphabet('23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ', 7);

/** Generate a cryptographically random short slug */
export function generateSlug(length = 7): string {
  return nanoid(length);
}

/** Validate and normalize a URL */
export function validateUrl(raw: string): { valid: boolean; url: string; error?: string } {
  if (!raw || raw.trim().length === 0) {
    return { valid: false, url: '', error: 'URL cannot be empty' };
  }

  let url = raw.trim();

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);

    // Block localhost and private IPs in production
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local')
    ) {
      return { valid: false, url, error: 'Private/local URLs are not allowed' };
    }

    // Must have a valid TLD
    if (!hostname.includes('.') || hostname.split('.').pop()!.length < 2) {
      return { valid: false, url, error: 'URL must have a valid domain' };
    }

    // Block potentially harmful protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, url, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    return { valid: true, url: parsed.toString() };
  } catch {
    return { valid: false, url, error: 'Invalid URL format' };
  }
}

/** Validate a custom slug */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) return { valid: false, error: 'Slug cannot be empty' };
  if (slug.length < 3) return { valid: false, error: 'Slug must be at least 3 characters' };
  if (slug.length > 50) return { valid: false, error: 'Slug cannot exceed 50 characters' };
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return { valid: false, error: 'Only letters, numbers, hyphens, and underscores allowed' };
  }

  // Reserved slugs
  const reserved = ['api', 'dashboard', 'login', 'register', 'auth', 'admin', 'settings', 'pricing', 'docs', 'help'];
  if (reserved.includes(slug.toLowerCase())) {
    return { valid: false, error: 'This slug is reserved' };
  }

  return { valid: true };
}

/** Format a number with compact notation */
export function formatCount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** Build the full short URL */
export function buildShortUrl(slug: string): string {
  const base = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${base}/${slug}`;
}

/** Detect device type from user agent */
export function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** Detect browser from user agent */
export function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

/** Detect OS from user agent */
export function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}

/** Copy text to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}

/** Truncate URL for display */
export function truncateUrl(url: string, maxLen = 50): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen) + '…';
}

/** Get domain from URL */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/** Check if a link is expired */
export function isExpired(expiresAt?: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}

/** Rate limiter — simple in-memory token bucket */
export class RateLimiter {
  private timestamps: number[] = [];
  constructor(private maxRequests: number, private windowMs: number) {}

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) return false;
    this.timestamps.push(now);
    return true;
  }

  timeUntilReset(): number {
    if (this.timestamps.length === 0) return 0;
    return this.windowMs - (Date.now() - this.timestamps[0]);
  }
}

// Global rate limiter — 10 short URLs per minute per session
export const linkRateLimiter = new RateLimiter(10, 60_000);
