export const SEVERITY = ["Very mild", "Mild", "Moderate", "Severe", "Very severe"] as const;

export type Entry = {
  id: string;
  area: string;
  note: string;
  severity: number;
  createdAt: string;
  /** Added in Entry detail, after a GP visit. */
  visitDate?: string; // YYYY-MM-DD
  gp?: string;
  gpSaid?: string;
};

const KEY = "trace.entries";

export function loadEntries(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Entry[];
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
