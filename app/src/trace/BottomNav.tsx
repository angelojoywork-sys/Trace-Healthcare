import { Heart, LayoutGrid, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "summary" | "gp" | "browse";

const TABS: { id: Tab; label: string; Icon: typeof Heart }[] = [
  { id: "summary", label: "Summary", Icon: Heart },
  { id: "gp", label: "Find GP", Icon: MapPin },
  { id: "browse", label: "Browse", Icon: LayoutGrid },
];

export function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav aria-label="Main" className="flex justify-around border-t border-line bg-background px-2 pt-2 pb-2">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-current={tab === id ? "page" : undefined}
          onClick={() => onTab(id)}
          className={cn(
            "relative grid h-12 w-20 place-items-center rounded-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
            tab === id && "text-highlight after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:bg-highlight",
          )}
        >
          <Icon className="size-5" />
        </button>
      ))}
    </nav>
  );
}
