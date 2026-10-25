import { useSyncExternalStore } from "react";
import type { AppData, Entry, Profile } from "./types";

const KEY = "trace.v1";
const empty: AppData = { version: 1, entries: [] };

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as AppData;
    return parsed && parsed.version === 1 ? parsed : empty;
  } catch {
    return empty;
  }
}

let state: AppData = load();
const listeners = new Set<() => void>();

function commit(next: AppData) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode); keep working in memory.
  }
  listeners.forEach((l) => l());
}

export function useData(): AppData {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export const getData = () => state;

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function saveProfile(profile: Profile) {
  commit({ ...state, profile });
}

export function addEntry(entry: Entry) {
  commit({ ...state, entries: [...state.entries, entry] });
}

export function updateEntry(id: string, patch: Partial<Entry>) {
  commit({
    ...state,
    entries: state.entries.map((e) => (e.id === id ? ({ ...e, ...patch } as Entry) : e)),
  });
}

export function removeEntry(id: string) {
  commit({ ...state, entries: state.entries.filter((e) => e.id !== id) });
}

export function replaceAll(data: AppData) {
  commit(data);
}

export function deleteEverything() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  commit({ ...empty });
}

// ---- PIN lock (a soft lock for a shared phone, not encryption) ----

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function setPin(pin: string | null) {
  if (!pin) {
    const { pin: _drop, ...rest } = state;
    commit(rest as AppData);
    return;
  }
  const salt = uid();
  commit({ ...state, pin: { salt, hash: await sha256(salt + pin) } });
}

export async function checkPin(pin: string) {
  if (!state.pin) return true;
  return (await sha256(state.pin.salt + pin)) === state.pin.hash;
}

export function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `trace-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
