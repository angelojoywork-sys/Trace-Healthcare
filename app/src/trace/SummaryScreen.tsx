import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasVisit, SEVERITY, type Entry } from "@/lib/entries";
import { isThisMonth, relativeDay, severityTone } from "./dates";

const cap = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";
const tone = { mild: "bg-severity-mild", moderate: "bg-severity-moderate", severe: "bg-severity-severe" } as const;

export function SeverityTag({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
      <span aria-hidden="true" className={cn("size-2", tone[severityTone(value)])} />
      {SEVERITY[value]}
    </span>
  );
}

type Props = { name: string; entries: Entry[]; saved: boolean; onLog: () => void; onOpen: (id: string) => void };

export function SummaryScreen({ name, entries, saved, onLog, onOpen }: Props) {
  const last = entries[0];
  const month = entries.filter((e) => isThisMonth(e.createdAt)).length;
  const visits = entries.filter(hasVisit).length;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-24">
        <header>
          <p className={cap}>{name ? `Hi ${name}` : "Your health log"}</p>
          <h1 className="text-3xl font-light">Summary</h1>
        </header>

        {saved && (
          <p role="status" className="border border-highlight px-4 py-3 font-mono text-xs tracking-widest text-highlight uppercase">
            Saved. Noted, take care.
          </p>
        )}

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
          </>
        )}
      </div>

      {last && (
        <Button
          type="button"
          aria-label="Log a symptom"
          onClick={onLog}
          className="absolute right-5 bottom-4 size-14 rounded-sm bg-highlight text-highlight-foreground hover:bg-highlight/90"
        >
          <Plus className="size-6" />
        </Button>
      )}
    </div>
  );
}

export function ComingNext({ title, line }: { title: string; line: string }) {
  return (
    <div className="flex flex-1 flex-col gap-3 px-5 pt-6">
      <h1 className="text-3xl font-light">{title}</h1>
      <p className="max-w-[32ch] text-muted-foreground">{line}</p>
    </div>
  );
}
