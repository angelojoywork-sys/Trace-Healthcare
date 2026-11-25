/** Severity is a number from 1 (barely there) to 10 (worst). Older logs used a 0-4 scale and are converted when read. */
const LEGACY_SCALE = [1, 3, 5, 8, 10];
export const severityWord = (v: number): "mild" | "moderate" | "severe" => (v <= 3 ? "mild" : v <= 7 ? "moderate" : "severe");

export type Entry = {
  id: string;
  area: string;
  note: string;
  severity: number; // 1-10
  scale?: 10;
  createdAt: string;
  /** Added in Entry detail, after a GP visit. */
  visitDate?: string; // YYYY-MM-DD
  gp?: string;
  gpSaid?: string;
};

const KEY = "trace.entries";

export function loadEntries(): Entry[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Entry[];
    return list.map((e) => (e.scale === 10 ? e : { ...e, severity: LEGACY_SCALE[e.severity] ?? 5, scale: 10 as const }));
  } catch {
    return [];
  }
}

export function saveEntry(e: Entry): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([e, ...loadEntries()]));
  } catch {
    /* storage unavailable: entry stays in memory only */
  }
}

export function updateEntry(id: string, patch: Partial<Omit<Entry, "id">>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadEntries().map((e) => (e.id === id ? { ...e, ...patch } : e))));
  } catch {
    /* storage unavailable */
  }
}

/** GP names used before, most recent first, for suggestions. */
export function knownGps(): string[] {
  const seen = new Set<string>();
  for (const e of loadEntries()) if (e.gp?.trim()) seen.add(e.gp.trim());
  return [...seen];
}

export const hasVisit = (e: Entry): boolean => !!(e.gp?.trim() || e.visitDate || e.gpSaid?.trim());

export function deleteEntry(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadEntries().filter((e) => e.id !== id)));
  } catch {
    /* storage unavailable */
  }
}

/** Put a deleted entry back (undo), keeping the list newest first. */
export function restoreEntry(entry: Entry): void {
  try {
    const list = [...loadEntries().filter((e) => e.id !== entry.id), entry].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}
