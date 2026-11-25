import { House, Search, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "summary" | "gp" | "browse";

const TABS: { id: Tab; label: string; Icon: typeof House }[] = [
  { id: "summary", label: "Summary", Icon: House },
  { id: "gp", label: "Find GP", Icon: Stethoscope },
  { id: "browse", label: "Browse", Icon: Search },
];

/** A floating pill that sits over the content, so screens need bottom padding to scroll clear of it. */
export function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav aria-label="Main" className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
      <div className="pointer-events-auto flex gap-1 rounded-full border border-line bg-background/80 p-1.5 shadow-lg backdrop-blur-xl">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id ? "page" : undefined}
            onClick={() => onTab(id)}
            className={cn(
              "flex h-14 w-[5.25rem] flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === id && "bg-card text-highlight",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
