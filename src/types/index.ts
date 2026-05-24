// ============================================================
// Core Type Definitions
// ============================================================

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

export interface Link {
  id: string;              // Firestore document ID
  slug: string;            // Short URL slug (e.g., "abc123")
  originalUrl: string;     // The destination URL
  userId: string;          // Owner's UID
  title?: string;          // Optional human-readable title
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null; // Optional expiration
  password?: string | null; // Optional password hash
  isActive: boolean;
  totalClicks: number;     // Denormalized click count (avoids extra reads)
  lastClickAt?: Date | null;
}

export interface LinkFormData {
  originalUrl: string;
  customSlug?: string;
  title?: string;
  expiresAt?: string;      // ISO date string from form input
  password?: string;
}

export interface AnalyticsEvent {
  id: string;
  linkId: string;
  slug: string;
  timestamp: Date;
  country?: string;
  city?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  referrer?: string;
  ip?: string;            // Hashed for privacy
}

export interface ClickStats {
  date: string;           // "YYYY-MM-DD"
  clicks: number;
}

export interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

export interface CountryStats {
  country: string;
  count: number;
}

export interface LinkAnalytics {
  totalClicks: number;
  clicksOverTime: ClickStats[];
  deviceBreakdown: DeviceStats[];
  topCountries: CountryStats[];
  recentClicks: AnalyticsEvent[];
}

// Firestore raw document types (timestamps are Firestore Timestamp)
export interface LinkDocument extends Omit<Link, 'createdAt' | 'updatedAt' | 'expiresAt' | 'lastClickAt'> {
  createdAt: { toDate(): Date } | Date;
  updatedAt: { toDate(): Date } | Date;
  expiresAt?: { toDate(): Date } | Date | null;
  lastClickAt?: { toDate(): Date } | Date | null;
}

export type SortField = 'createdAt' | 'totalClicks' | 'lastClickAt';
export type SortDirection = 'asc' | 'desc';

export interface LinkFilter {
  search: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  showExpired: boolean;
}
