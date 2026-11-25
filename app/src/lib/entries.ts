export const SEVERITY = ["Very mild", "Mild", "Moderate", "Severe", "Very severe"] as const;

export type Entry = { id: string; area: string; note: string; severity: number; createdAt: string };

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
