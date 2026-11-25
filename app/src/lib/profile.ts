import type { BodyView } from "@/trace/HologramCanvas";

export type Gender = "female" | "male" | "other" | "none";
export type Profile = { name: string; gender: Gender | null; body: BodyView };

const KEY = "trace.profile";

/** Which hologram body a gender choice starts with. Other and "prefer not to say" use the neutral body. */
export const bodyForGender = (g: Gender | null): BodyView => (g === "female" ? "female" : g === "male" ? "male" : "neutral");

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: profile lasts for this session only */
  }
}
