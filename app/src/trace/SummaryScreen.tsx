import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasVisit, type Entry } from "@/lib/entries";
import { loadFeedback, saveFeedback } from "@/lib/feedback";
import { FeedbackCard } from "./FeedbackCard";
import { isThisMonth, relativeDay, severityTone } from "./dates";

const cap = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";
const tone = { mild: "bg-severity-mild", moderate: "bg-severity-moderate", severe: "bg-severity-severe" } as const;

export function SeverityTag({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
      <span aria-hidden="true" className={cn("size-2", tone[severityTone(value)])} />
      {value}/10
    </span>
  );
}

type Props = { name: string; entries: Entry[]; saved: boolean; onLog: () => void; onOpen: (id: string) => void };

export function SummaryScreen({ name, entries, saved, onLog, onOpen }: Props) {
  const [fb, setFb] = useState(loadFeedback);
  const [fbOpen, setFbOpen] = useState(false);
  const last = entries[0];
  const month = entries.filter((e) => isThisMonth(e.createdAt)).length;
  const visits = entries.filter(hasVisit).length;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-32">
        <header className="glass px-5 py-4">
          <p className={cap}>{name ? `Hi ${name}` : "Your health log"}</p>
          <h1 className="text-3xl font-light">Summary</h1>
        </header>

        {saved && (
          <p role="status" className="rounded-2xl border border-highlight bg-white/50 px-4 py-3 font-mono text-xs tracking-widest text-highlight uppercase backdrop-blur-md">
            Log saved
          </p>
        )}

        {last && (fb === "open" || fbOpen) && <FeedbackCard onClose={() => { setFbOpen(false); setFb(loadFeedback()); }} />}

        {!last ? (
          <section className="bracket flex flex-col gap-4 px-5 py-8">
            <h2 className="text-2xl leading-tight font-light">Nothing logged yet.</h2>
            <p className="text-muted-foreground">Tap where it hurts. It takes about ten seconds.</p>
            <Button size="lg" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={onLog}>Log your first symptom</Button>
          </section>
        ) : (
          <>
            <button type="button" onClick={() => onOpen(last.id)} aria-label={`Last logged: ${last.area}. Open details`} className="bracket flex flex-col gap-2 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <p className={cap}>Last logged</p>
              <p className="text-2xl font-light">{last.area}</p>
              <div className="flex w-full items-center justify-between">
                <SeverityTag value={last.severity} />
                <span className={cap}>{relativeDay(last.createdAt)}</span>
              </div>
              {last.note && <p className="text-muted-foreground">{last.note}</p>}
              {!hasVisit(last) && <p className="font-mono text-[11px] tracking-widest text-highlight uppercase">Add GP visit details →</p>}
            </button>

            <div className="grid grid-cols-3 gap-3">
              <div className="bracket flex flex-col gap-1 px-3 py-3"><p className={cap}>This month</p><p className="text-2xl font-light">{month}</p></div>
              <div className="bracket flex flex-col gap-1 px-3 py-3"><p className={cap}>Visits</p><p className="text-2xl font-light">{visits}</p></div>
              <div className="bracket flex flex-col gap-1 px-3 py-3"><p className={cap}>All logs</p><p className="text-2xl font-light">{entries.length}</p></div>
            </div>

            <section aria-label="Recent" className="flex flex-col gap-3">
              <h2 className={cap}>Recent</h2>
              <ul className="flex flex-col gap-3">
                {entries.slice(0, 5).map((e) => (
                  <li key={e.id}>
                    <button type="button" onClick={() => onOpen(e.id)} className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-line pb-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="flex flex-col gap-1">
                        <span className="text-lg font-light">{e.area}</span>
                        <SeverityTag value={e.severity} />
                      </span>
                      <span className={cap}>{relativeDay(e.createdAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            {fb === "dismissed" && !fbOpen && (
              <Button variant="ghost" onClick={() => { saveFeedback("open"); setFb("open"); }} className="self-start font-mono text-xs underline underline-offset-4">Share feedback on this test</Button>
            )}
          </>
        )}
      </div>

      {last && (
        <Button
          type="button"
          aria-label="Log a symptom"
          onClick={onLog}
          className="absolute right-5 bottom-28 size-14 rounded-sm bg-highlight text-highlight-foreground hover:bg-highlight/90"
        >
          <Plus className="size-6" />
        </Button>
      )}
    </div>
  );
}
