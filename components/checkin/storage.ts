/**
 * On-device check-in history. Everything stays in localStorage — nothing is
 * ever sent anywhere. All access is SSR-guarded and never throws.
 */

const STORAGE_KEY = "aura.checkins.v1";

export interface CheckinEntry {
  id: string;
  /** Epoch milliseconds when the check-in was saved. */
  ts: number;
  mood: number; // 1..5
  energy: number; // 1..5
  note: string;
}

function isEntry(value: unknown): value is CheckinEntry {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.ts === "number" &&
    typeof e.mood === "number" &&
    typeof e.energy === "number" &&
    typeof e.note === "string"
  );
}

export function loadCheckins(): CheckinEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry);
  } catch {
    return [];
  }
}

export function saveCheckins(entries: CheckinEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage may be full or disabled — fail quietly.
  }
}

export function clearCheckins(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

/** Local YYYY-MM-DD for an epoch timestamp. */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Number of distinct calendar days that have at least one check-in. */
export function streakDays(entries: CheckinEntry[]): number {
  const days = new Set<string>();
  for (const e of entries) days.add(dayKey(e.ts));
  return days.size;
}
