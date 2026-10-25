import type { Feeling } from "./types";

export const FEELINGS: { value: Feeling; emoji: string; label: string }[] = [
  { value: 1, emoji: "😣", label: "Awful" },
  { value: 2, emoji: "😟", label: "Not great" },
  { value: 3, emoji: "😐", label: "OK" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😌", label: "Relieved" },
];

export const feelingOf = (v?: number) => FEELINGS.find((f) => f.value === v);

export function fmtDate(iso: string, withTime = false) {
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  return d.toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function daysSince(iso: string, now = new Date()) {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
}

export function daysUntil(isoDate: string, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(isoDate + "T00:00:00").getTime() - today.getTime()) / 86_400_000);
}

export function relDay(isoDate: string) {
  const n = daysUntil(isoDate);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
}

/** Download a calendar reminder; works on phones without needing push notifications. */
export function downloadIcs(dateIso: string, title: string, description: string) {
  const d = dateIso.replace(/-/g, "");
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trace//Prototype//EN",
    "BEGIN:VEVENT",
    `UID:${stamp}-${Math.random().toString(36).slice(2)}@trace`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${d}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:PT9H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "trace-follow-up.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}
