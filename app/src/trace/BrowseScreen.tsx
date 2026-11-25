import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { severityWord, type Entry } from "@/lib/entries";
import { fileCounts } from "@/lib/files";
import { relativeDay } from "./dates";
import { SeverityTag } from "./SummaryScreen";

const cap = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";

const haystack = (e: Entry) => [e.area, e.note, e.gp, e.gpSaid, `${e.severity}/10`, severityWord(e.severity)].filter(Boolean).join(" ").toLowerCase();

export function matches(e: Entry, query: string): boolean {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const h = haystack(e);
  return tokens.every((t) => h.includes(t));
}

const monthLabel = (iso: string) => new Date(iso).toLocaleDateString("en-IE", { month: "long", year: "numeric" });

type Props = { entries: Entry[]; query: string; onQuery: (q: string) => void; onOpen: (id: string) => void };

export function BrowseScreen({ entries, query, onQuery, onOpen }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => { fileCounts().then(setCounts); }, [entries]);

  const q = query.trim();
  const shown = useMemo(() => (q ? entries.filter((e) => matches(e, q)) : entries), [entries, q]);

  // Behaviour only: how long the search was and how many results, never the words.
  useEffect(() => {
    if (!q) return;
    const t = setTimeout(() => track("search", { length: q.length, results: shown.length }), 700);
    return () => clearTimeout(t);
  }, [q, shown.length]);

  const groups = useMemo(() => {
    const out: { label: string; items: Entry[] }[] = [];
    for (const e of shown) {
      const label = monthLabel(e.createdAt);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(e);
      else out.push({ label, items: [e] });
    }
    return out;
  }, [shown]);

  const oldest = shown.length > 1 ? shown[shown.length - 1] : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-4 px-5 pt-6 pb-3">
        <h1 className="text-3xl font-light">Browse</h1>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search symptoms, doctors, notes"
            placeholder="Search symptoms, GPs, notes"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            className="h-12 rounded-sm pr-12 pl-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <Button type="button" variant="ghost" size="icon" aria-label="Clear search" onClick={() => onQuery("")} className="absolute top-1/2 right-0 size-12 -translate-y-1/2 rounded-sm">
              <X className="size-4" />
            </Button>
          )}
        </div>
        {q && (
          <p className={cap} aria-live="polite">
            {shown.length} {shown.length === 1 ? "result" : "results"}
            {oldest ? ` · first ${relativeDay(oldest.createdAt)}` : ""}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-32">
        {entries.length === 0 ? (
          <p className="max-w-[32ch] text-muted-foreground">Nothing to browse yet. Log a symptom and it will show up here.</p>
        ) : shown.length === 0 ? (
          <p className="max-w-[34ch] text-muted-foreground">No matches for “{q}”. Try a symptom, a doctor's name, or a word like “severe”.</p>
        ) : (
          groups.map((g) => (
            <section key={g.label} aria-label={g.label} className="flex flex-col gap-3">
              <h2 className={cap}>{g.label}</h2>
              <ul className="flex flex-col gap-3">
                {g.items.map((e) => {
                  const files = counts[e.id] ?? 0;
                  const detail = [e.gp?.trim() || (e.gpSaid || e.visitDate ? "GP visit" : "No visit"), files ? `${files} ${files === 1 ? "file" : "files"}` : ""].filter(Boolean).join(" · ");
                  const snippet = q ? (e.gpSaid && matches({ ...e, note: "", area: "", gp: "" }, q) ? e.gpSaid : e.note) : "";
                  return (
                    <li key={e.id}>
                      <button type="button" onClick={() => onOpen(e.id)} className="bracket flex min-h-12 w-full flex-col gap-1 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="flex w-full items-baseline justify-between gap-3">
                          <span className="text-lg font-light">{e.area}</span>
                          <span className={cap}>{relativeDay(e.createdAt)}</span>
                        </span>
                        <SeverityTag value={e.severity} />
                        <span className={cap}>{detail}</span>
                        {snippet && <span className="line-clamp-2 text-sm text-muted-foreground">{snippet}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
