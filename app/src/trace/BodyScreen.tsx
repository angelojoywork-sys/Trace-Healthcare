import { lazy, Suspense, useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { AREAS, hasWebGL, type Pick3D } from "./areas";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BodyView } from "./HologramCanvas";
import { NoteSheet } from "./NoteSheet";

const HologramCanvas = lazy(() => import("./HologramCanvas"));

type Sel = { area: string; via: "3d" | "list"; pick?: Pick3D };
type Props = { onClose?: () => void; view: BodyView; onViewChange: (v: BodyView) => void; onDone: (r: { area: string; note: string; via: "3d" | "list" }) => void };

export function BodyScreen({ view, onViewChange, onDone, onClose }: Props) {
  const [gl, setGl] = useState(() => hasWebGL());
  const [list, setList] = useState(false);
  const [sel, setSel] = useState<Sel | null>(null);
  const [picking, setPicking] = useState(false);

  const pickedAt = useRef(0);
  const choose = (s: Sel) => { pickedAt.current = Date.now(); setSel(s); track("area_selected", { via: s.via }); };
  const fail = () => { setGl(false); setList(true); track("webgl_unavailable"); };
  const showList = list || !gl;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="glass mx-3 mt-3 flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex items-start gap-3">
          {sel ? (
            <Button variant="outline" size="icon" aria-label="Back" className="size-11 rounded-sm" onClick={() => setSel(null)}>
              <ChevronLeft className="size-5" />
            </Button>
          ) : onClose ? (
            <Button variant="outline" size="icon" aria-label="Close" className="size-11 rounded-sm" onClick={onClose}>
              <X className="size-5" />
            </Button>
          ) : null}
          <div>
            <h1 className="font-mono text-sm tracking-widest uppercase">{sel ? sel.area : "Tap to log"}</h1>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{sel ? "Add a note" : showList ? "Choose an area" : "Drag to turn"}</p>
          </div>
        </div>
        <span className="font-mono text-xs tracking-widest text-highlight">{sel ? "02" : "01"} / 03</span>
      </header>

      {/* While zoomed in, tapping anywhere outside the note panel zooms back out. The short delay stops the tap that zoomed in from also zooming out. */}
      <div className="glass relative mx-3 my-3 min-h-0 flex-1 overflow-hidden" onClick={() => { if (sel && Date.now() - pickedAt.current > 500) setSel(null); }}>
        {showList ? (
          <ul className="grid grid-cols-2 gap-3 p-5">
            {AREAS.map((a) => (
              <li key={a}>
                <Button variant="outline" className="h-12 w-full justify-start rounded-sm font-mono text-xs tracking-widest uppercase" onClick={() => choose({ area: a, via: "list" })}>
                  {a}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <Suspense fallback={<p className="p-5 font-mono text-xs tracking-widest text-muted-foreground uppercase">Loading body</p>}>
            <HologramCanvas
              view={view}
              focus={sel?.pick ? { point: sel.pick.point, normal: sel.pick.normal } : null}
              onPick={(p) => !sel && choose({ area: p.area, via: "3d", pick: p })}
              onFail={fail}
            />
          </Suspense>
        )}
        {sel && (
          <NoteSheet
            area={sel.area}
            onSubmit={(note) => onDone({ area: sel.area, note, via: sel.via })}
            onSkip={() => onDone({ area: sel.area, note: "", via: sel.via })}
          />
        )}
      </div>

      {!sel && gl && (
        <footer className="flex flex-col items-center gap-1 px-5 pt-2 pb-4">
          {picking && !list && (
            <ToggleGroup
              variant="outline"
              aria-label="Body view"
              value={[view]}
              onValueChange={(v) => { if (v[0]) { onViewChange(v[0] as BodyView); setPicking(false); } }}
            >
              {(["female", "male", "neutral"] as const).map((b) => (
                <ToggleGroupItem key={b} value={b} className="h-11 rounded-sm font-mono text-xs tracking-widest uppercase data-pressed:border-highlight data-pressed:bg-highlight/10 data-pressed:text-highlight">{b}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" className="font-mono underline underline-offset-4" onClick={() => { setList(!list); setPicking(false); if (!list) track("list_view_opened"); }}>
              {list ? "Back to body" : "List view"}
            </Button>
            {!list && (
              <Button variant="ghost" className="font-mono underline underline-offset-4" onClick={() => setPicking(!picking)}>Change body</Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
