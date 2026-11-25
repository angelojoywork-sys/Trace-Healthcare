export function relativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

export const isThisMonth = (iso: string, now = new Date()): boolean => {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

/** Severity 1-3 mild, 4-7 moderate, 8-10 severe. Used for the colour marker and always paired with the word. */
export const severityTone = (v: number): "mild" | "moderate" | "severe" => (v <= 3 ? "mild" : v <= 7 ? "moderate" : "severe");
