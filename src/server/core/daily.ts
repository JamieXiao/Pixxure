// src/server/core/daily.ts
// minimal-API version (works with Devvit's Redis client):
// - stores each image as JSON at key `img:{id}`
// - tracks all image IDs in JSON array at `images:all`
// - tracks "last used" scores in JSON map at `images:lastUsed` (id -> YYYYMMDD number; 0 = never used)
// - caches today's pick in `daily:YYYY-MM-DD` with a TTL to next UTC midnight (if expire() is available)

import { randomUUID } from 'node:crypto';
import { redis } from '@devvit/web/server';

// ---------- Types ----------
export type ImageDoc = {
  id: string;
  name: string;
  labels: string[];
  imageUrl: string;
  thumbUrl?: string;
  width?: number;
  height?: number;
  createdAt: string; // ISO
};

// ---------- Keys ----------
const IMG = (id: string) => `img:${id}`;
const ALL = 'images:all';
const LAST_USED = 'images:lastUsed';
const DAILY = (dateKey: string) => `daily:${dateKey}`;

// ---------- Date helpers ----------
function todayUTCKey(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayUTCScore(): number {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return Number(`${y}${m}${d}`); // e.g., 20250915
}

function secondsUntilNextUtcMidnight(): number {
  const now = new Date();
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  );
  return Math.max(1, Math.floor((next - now.getTime()) / 1000));
}

// ---------- JSON helpers ----------
function parseJsonArray(s?: string | null): string[] {
  try { return s ? JSON.parse(s) : []; } catch { return []; }
}
function parseJsonMap(s?: string | null): Record<string, number> {
  try { return s ? JSON.parse(s) as Record<string, number> : {}; } catch { return {}; }
}

// load/save master ID list
async function readAllIds(): Promise<string[]> {
  return parseJsonArray(await redis.get(ALL));
}
async function writeAllIds(ids: string[]): Promise<void> {
  await redis.set(ALL, JSON.stringify(ids));
}

// load/save last-used map (id -> score)
async function readLastUsed(): Promise<Record<string, number>> {
  return parseJsonMap(await redis.get(LAST_USED));
}
async function writeLastUsed(map: Record<string, number>): Promise<void> {
  await redis.set(LAST_USED, JSON.stringify(map));
}

// pick least-recently-used id (prefer score 0 / missing)
function pickLRU(ids: string[], lastUsed: Record<string, number>): string {
  if (ids.length === 0) throw new Error('No images seeded');
  let bestId = ids[0]!; // non-null assertion since we checked length
  let bestScore = lastUsed[bestId] ?? 0;

  for (let i = 1; i < ids.length; i++) {
    const id = ids[i]!; // non-null assertion since i < length
    const score = lastUsed[id] ?? 0;
    // lower score = older / never-used -> preferred
    if (score < bestScore) {
      bestId = id;
      bestScore = score;
    }
  }
  return bestId;
}

// ---------- Public API ----------

// add/seed an image (metadata only; we store URLs not bytes)
export async function addImage(input: {
  id?: string;
  name: string;
  labels: string[];
  imageUrl: string;
  thumbUrl?: string;
  width?: number;
  height?: number;
}): Promise<{ id: string }> {
  const { id: maybeId, name, labels, imageUrl, thumbUrl, width, height } = input;

  if (!name || !Array.isArray(labels) || !imageUrl) {
    throw new Error('addImage requires { name, labels[], imageUrl }');
  }

  const id = (typeof maybeId === 'string' && maybeId.trim()) ? maybeId : randomUUID();
  const doc: ImageDoc = {
    id,
    name,
    labels,
    imageUrl,
    ...(thumbUrl && { thumbUrl }),
    ...(width && { width }),
    ...(height && { height }),
    createdAt: new Date().toISOString(),
  };

  // store image doc
  await redis.set(IMG(id), JSON.stringify(doc));

  // update master list (dedupe)
  const ids = await readAllIds();
  if (!ids.includes(id)) {
    ids.push(id);
    await writeAllIds(ids);
  }

  // initialize last-used score if missing
  const lastUsed = await readLastUsed();
  if (lastUsed[id] == null) {
    lastUsed[id] = 0;
    await writeLastUsed(lastUsed);
  }

  return { id };
}

/**
 * returns the same image for everyone for the current UTC day.
 * first call each day picks the least-recently-used image,
 * caches it under daily:YYYY-MM-DD (TTL to next UTC midnight if possible),
 * and updates its last-used score to today.
 */
export async function getDailyImage(): Promise<{ dateUTC: string; image: ImageDoc }> {
  const dateKey = todayUTCKey();
  const dailyKey = DAILY(dateKey);

  // if already chosen, return it
  let imageId = await redis.get(dailyKey);

  if (!imageId) {
    // choose a candidate
    const [ids, lastUsed] = await Promise.all([readAllIds(), readLastUsed()]);
    if (ids.length === 0) throw new Error('No images seeded. Use POST /api/images first.');

    const candidateId = pickLRU(ids, lastUsed);

    // try to "claim" today atomically if the client supports options.
    // if not, fall back to simple set + expire (not strictly atomic, but fine for this use).
    try {
      // @ts-ignore – accept clients whose type defs don’t include options
      const ok = await (redis as any).set(dailyKey, candidateId, { nx: true, ex: secondsUntilNextUtcMidnight() });
      if (ok) {
        imageId = candidateId;
      } else {
        imageId = await redis.get(dailyKey);
      }
    } catch {
      // fallback: set then expire (best-effort)
      await redis.set(dailyKey, candidateId);
      try {
        // @ts-ignore – expire may not be typed on some clients
        await (redis as any).expire?.(dailyKey, secondsUntilNextUtcMidnight());
      } catch { /* ignore */ }
      imageId = candidateId;
    }

    // update last-used score (idempotent even if two callers race)
    const map2 = await readLastUsed();
    map2[candidateId] = todayUTCScore();
    await writeLastUsed(map2);
  }

  if (!imageId) throw new Error('Could not assign daily image.');

  const raw = await redis.get(IMG(imageId));
  if (!raw) throw new Error('Daily image metadata missing.');
  const image = JSON.parse(raw) as ImageDoc;

  return { dateUTC: dateKey, image };
}

// (optional) tiny dev helper to force a re-pick while testing
export async function _debugResetDaily(): Promise<void> {
  const key = DAILY(todayUTCKey());
  try {
    // @ts-ignore – del may not be typed
    await (redis as any).del?.(key);
  } catch { /* ignore */ }
}
