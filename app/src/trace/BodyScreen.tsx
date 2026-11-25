import { lazy, Suspense, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { AREAS, hasWebGL, type Pick3D } from "./areas";
import type { BodyView } from "./HologramCanvas";
import { NoteSheet } from "./NoteSheet";

const HologramCanvas = lazy(() => import("./HologramCanvas"));

type Sel = { area: string; via: "3d" | "list"; pick?: Pick3D };
type Props = { onDone: (r: { area: string; note: string; via: "3d" | "list" }) => void };

// Until the profile screen exists, pick the body with ?body=female|male|neutral.
const bodyFromUrl = (): BodyView => {
  const b = new URLSearchParams(location.search).get("body");
  return b === "female" || b === "male" ? b : "neutral";
};

export function BodyScreen({ onDone }: Props) {
  const [gl, setGl] = useState(() => hasWebGL());
  const [list, setList] = useState(false);
  const [sel, setSel] = useState<Sel | null>(null);

  const choose = (s: Sel) => { setSel(s); track("area_selected", { area: s.area, via: s.via }); };
  const fail = () => { setGl(false); setList(true); track("webgl_unavailable"); };
  const showList = list || !gl;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {sel && (
            <Button variant="outline" size="icon" aria-label="Back" className="size-11 rounded-sm" onClick={() => setSel(null)}>
              <ChevronLeft className="size-5" />
            </Button>
          )}
          <div>
            <h1 className="font-mono text-sm tracking-widest uppercase">{sel ? sel.area : "Tap to log"}</h1>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{sel ? "Add a note" : showList ? "Choose an area" : "Drag to turn"}</p>
          </div>
        </div>
        <span className="font-mono text-xs tracking-widest text-highlight">{sel ? "02" : "01"} / 03</span>
      </header>

      <div className="relative min-h-0 flex-1">
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
              view={bodyFromUrl()}
              focus={sel?.pick ? { point: sel.pick.point, normal: sel.pick.normal } : null}
              onPick={(p) => !sel && choose({ area: p.area, via: "3d", pick: p })}
              onFail={fail}
            />
          </Suspense>
        )}
        {sel && (
          <NoteSheet
            area={sel.area}
            xy={sel.pick ? { x: sel.pick.x, y: sel.pick.y } : undefined}
            onSubmit={(note) => onDone({ area: sel.area, note, via: sel.via })}
            onSkip={() => onDone({ area: sel.area, note: "", via: sel.via })}
          />
        )}
      </div>

      {!sel && gl && (
        <footer className="px-5 pt-2 pb-4 text-center">
          <Button variant="ghost" className="font-mono underline underline-offset-4" onClick={() => { setList(!list); if (!list) track("list_view_opened"); }}>
            {list ? "Back to body" : "List view"}
          </Button>
        </footer>
      )}
    </div>
  );
}
