// ============================================================
// Firestore Service — All DB operations
// Cost-optimized: batched writes, denormalized counts, caching
// ============================================================
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Link, LinkDocument, LinkFormData, AnalyticsEvent, LinkAnalytics, ClickStats } from '@/types';
import { generateSlug, detectDevice, detectBrowser, detectOS } from './utils';
import { format, subDays } from 'date-fns';

// ── Collection references ────────────────────────────────────
const linksCol    = collection(db, 'links');
const analyticsCol = collection(db, 'analytics');

// ── Helpers ─────────────────────────────────────────────────
function docToLink(id: string, data: LinkDocument): Link {
  const toDate = (v: unknown): Date => {
    if (!v) return new Date();
    if (v instanceof Date) return v;
    if (typeof v === 'object' && 'toDate' in (v as object)) return (v as Timestamp).toDate();
    return new Date(v as string);
  };

  return {
    id,
    slug:         data.slug,
    originalUrl:  data.originalUrl,
    userId:       data.userId,
    title:        data.title,
    createdAt:    toDate(data.createdAt),
    updatedAt:    toDate(data.updatedAt),
    expiresAt:    data.expiresAt ? toDate(data.expiresAt) : null,
    password:     data.password ?? null,
    isActive:     data.isActive ?? true,
    totalClicks:  data.totalClicks ?? 0,
    lastClickAt:  data.lastClickAt ? toDate(data.lastClickAt) : null,
  };
}

// ── Slug existence check ─────────────────────────────────────
export async function slugExists(slug: string): Promise<boolean> {
  const q = query(linksCol, where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Get a unique slug — retry if collision */
export async function getUniqueSlug(customSlug?: string): Promise<string> {
  if (customSlug) {
    const taken = await slugExists(customSlug);
    if (taken) throw new Error('This custom slug is already taken');
    return customSlug;
  }

  // Auto-generate with collision avoidance
  for (let i = 0; i < 5; i++) {
    const slug = generateSlug();
    const taken = await slugExists(slug);
    if (!taken) return slug;
  }
  // Fallback: longer slug
  return generateSlug(9);
}

// ── Create link ──────────────────────────────────────────────
export async function createLink(userId: string, form: LinkFormData): Promise<Link> {
  const slug = await getUniqueSlug(form.customSlug);

  const docData = {
    slug,
    originalUrl:  form.originalUrl,
    userId,
    title:        form.title || null,
    createdAt:    serverTimestamp(),
    updatedAt:    serverTimestamp(),
    expiresAt:    form.expiresAt ? Timestamp.fromDate(new Date(form.expiresAt)) : null,
    password:     form.password || null,
    isActive:     true,
    totalClicks:  0,
    lastClickAt:  null,
  };

  const ref = await addDoc(linksCol, docData);
  return docToLink(ref.id, { ...docData, id: ref.id } as unknown as LinkDocument);
}

// ── Get link by slug (for redirect — single read) ────────────
export async function getLinkBySlug(slug: string): Promise<Link | null> {
  const q = query(linksCol, where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToLink(d.id, d.data() as LinkDocument);
}

// ── Get user links ───────────────────────────────────────────
export async function getUserLinks(userId: string): Promise<Link[]> {
  const q = query(
    linksCol,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToLink(d.id, d.data() as LinkDocument));
}

/** Real-time listener for user links */
export function subscribeUserLinks(userId: string, cb: (links: Link[]) => void): Unsubscribe {
  const q = query(linksCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => docToLink(d.id, d.data() as LinkDocument)));
  });
}

// ── Update link ──────────────────────────────────────────────
export async function updateLink(
  linkId: string,
  updates: Partial<Pick<Link, 'title' | 'slug' | 'expiresAt' | 'isActive' | 'password'>>
): Promise<void> {
  const ref = doc(db, 'links', linkId);

  // If changing slug, check for collision first
  if (updates.slug) {
    const taken = await slugExists(updates.slug);
    if (taken) throw new Error('Slug is already taken');
  }

  await updateDoc(ref, {
    ...updates,
    expiresAt: updates.expiresAt ? Timestamp.fromDate(new Date(updates.expiresAt)) : null,
    updatedAt: serverTimestamp(),
  });
}

// ── Delete link ──────────────────────────────────────────────
export async function deleteLink(linkId: string): Promise<void> {
  const batch = writeBatch(db);

  // Delete the link
  batch.delete(doc(db, 'links', linkId));

  // Note: analytics subcollection requires a Cloud Function for full cleanup.
  // For free tier, we skip it — orphaned analytics docs are cheap and cleaned by TTL rules.

  await batch.commit();
}

// ── Track click (analytics write) ────────────────────────────
export async function trackClick(link: Link): Promise<void> {
  const batch = writeBatch(db);

  // 1. Increment denormalized counter on the link (avoids reads for dashboard)
  const linkRef = doc(db, 'links', link.id);
  batch.update(linkRef, {
    totalClicks: increment(1),
    lastClickAt: serverTimestamp(),
  });

  // 2. Write analytics event (one write per click)
  const eventRef = doc(analyticsCol);
  const event: Omit<AnalyticsEvent, 'id'> = {
    linkId:    link.id,
    slug:      link.slug,
    timestamp: new Date(),
    device:    detectDevice(),
    browser:   detectBrowser(),
    os:        detectOS(),
    referrer:  document.referrer || 'direct',
  };
  batch.set(eventRef, {
    ...event,
    timestamp: serverTimestamp(),
  });

  await batch.commit();
}

// ── Get analytics for a link ─────────────────────────────────
export async function getLinkAnalytics(linkId: string, days = 30): Promise<LinkAnalytics> {
  const since = subDays(new Date(), days);
  const sinceTs = Timestamp.fromDate(since);

  const q = query(
    analyticsCol,
    where('linkId', '==', linkId),
    where('timestamp', '>=', sinceTs),
    orderBy('timestamp', 'desc'),
    limit(500) // Cap reads for cost control
  );

  const snap = await getDocs(q);
  const events = snap.docs.map((d) => ({
    id:        d.id,
    ...d.data(),
    timestamp: (d.data().timestamp as Timestamp).toDate(),
  })) as AnalyticsEvent[];

  // Aggregate clicks per day
  const dayMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    dayMap.set(format(subDays(new Date(), i), 'yyyy-MM-dd'), 0);
  }
  events.forEach((e) => {
    const key = format(e.timestamp, 'yyyy-MM-dd');
    dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  });
  const clicksOverTime: ClickStats[] = Array.from(dayMap.entries()).map(([date, clicks]) => ({ date, clicks }));

  // Device breakdown
  const deviceMap = new Map<string, number>();
  events.forEach((e) => {
    if (e.device) deviceMap.set(e.device, (deviceMap.get(e.device) ?? 0) + 1);
  });
  const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({
    device,
    count,
    percentage: events.length > 0 ? Math.round((count / events.length) * 100) : 0,
  }));

  // Top countries
  const countryMap = new Map<string, number>();
  events.forEach((e) => {
    if (e.country) countryMap.set(e.country, (countryMap.get(e.country) ?? 0) + 1);
  });
  const topCountries = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalClicks:    events.length,
    clicksOverTime,
    deviceBreakdown,
    topCountries,
    recentClicks:   events.slice(0, 20),
  };
}
