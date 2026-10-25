import { useState, type KeyboardEvent } from "react";
import { REGIONS, regionById } from "../lib/regions";

type View = "front" | "back" | "face";

interface Part {
  id: string;
  /** SVG element: ellipse or rounded rect or path */
  shape: { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number } | { kind: "rect"; x: number; y: number; w: number; h: number; r?: number } | { kind: "path"; d: string };
  label?: [number, number, string];
}

// Neutral silhouette (design principle 8: every body). Front view is mirrored: the person's left is on the viewer's right.
const FRONT: Part[] = [
  { id: "@face", shape: { kind: "ellipse", cx: 100, cy: 38, rx: 24, ry: 28 }, label: [100, 42, "Face"] },
  { id: "throat", shape: { kind: "rect", x: 89, y: 66, w: 22, h: 16, r: 6 } },
  { id: "chest", shape: { kind: "rect", x: 64, y: 84, w: 72, h: 54, r: 14 }, label: [100, 115, "Chest"] },
  { id: "abdomen-upper", shape: { kind: "rect", x: 68, y: 140, w: 64, h: 32, r: 8 }, label: [100, 160, "Upper"] },
  { id: "abdomen-lower", shape: { kind: "rect", x: 68, y: 174, w: 64, h: 30, r: 8 }, label: [100, 193, "Lower"] },
  { id: "pelvis", shape: { kind: "path", d: "M68 206h64l-8 30H76z" }, label: [100, 225, "Pelvis"] },
  { id: "arm-right", shape: { kind: "path", d: "M62 88c-14 4-18 14-20 30l-10 80c-1 10 12 12 14 2l14-74z" } },
  { id: "arm-left", shape: { kind: "path", d: "M138 88c14 4 18 14 20 30l10 80c1 10-12 12-14 2l-14-74z" } },
  { id: "leg-right", shape: { kind: "path", d: "M76 238h22l-2 140c0 8-16 8-16 0z" } },
  { id: "leg-left", shape: { kind: "path", d: "M102 238h22l-4 140c0 8-16 8-16 0z" } },
];

const BACK: Part[] = [
  { id: "forehead", shape: { kind: "ellipse", cx: 100, cy: 38, rx: 24, ry: 28 }, label: [100, 42, "Head"] },
  { id: "throat", shape: { kind: "rect", x: 89, y: 66, w: 22, h: 16, r: 6 } },
  { id: "back-upper", shape: { kind: "rect", x: 64, y: 84, w: 72, h: 70, r: 14 }, label: [100, 122, "Upper back"] },
  { id: "back-lower", shape: { kind: "rect", x: 68, y: 156, w: 64, h: 50, r: 8 }, label: [100, 185, "Lower back"] },
  { id: "pelvis", shape: { kind: "path", d: "M68 208h64l-8 28H76z" } },
  { id: "arm-left", shape: { kind: "path", d: "M62 88c-14 4-18 14-20 30l-10 80c-1 10 12 12 14 2l14-74z" } },
  { id: "arm-right", shape: { kind: "path", d: "M138 88c14 4 18 14 20 30l10 80c1 10-12 12-14 2l-14-74z" } },
  { id: "leg-left", shape: { kind: "path", d: "M76 238h22l-2 140c0 8-16 8-16 0z" } },
  { id: "leg-right", shape: { kind: "path", d: "M102 238h22l-4 140c0 8-16 8-16 0z" } },
];

// Face/jaw/mouth detail. The founding story was a toothache that felt like an ear problem.
const FACE: Part[] = [
  { id: "forehead", shape: { kind: "path", d: "M50 90c0-50 30-70 50-70s50 20 50 70z" }, label: [100, 65, "Forehead"] },
  { id: "ear-right", shape: { kind: "ellipse", cx: 38, cy: 128, rx: 12, ry: 22 }, label: [38, 132, "Ear"] },
  { id: "ear-left", shape: { kind: "ellipse", cx: 162, cy: 128, rx: 12, ry: 22 }, label: [162, 132, "Ear"] },
  { id: "eyes", shape: { kind: "rect", x: 56, y: 94, w: 88, h: 24, r: 12 }, label: [100, 110, "Eyes"] },
  { id: "nose-sinus", shape: { kind: "path", d: "M90 120h20l6 34H84z" }, label: [100, 142, "Nose"] },
  { id: "cheek-right", shape: { kind: "rect", x: 52, y: 120, w: 30, h: 36, r: 10 }, label: [67, 142, "Cheek"] },
  { id: "cheek-left", shape: { kind: "rect", x: 118, y: 120, w: 30, h: 36, r: 10 }, label: [133, 142, "Cheek"] },
  { id: "teeth-upper", shape: { kind: "rect", x: 76, y: 160, w: 48, h: 14, r: 5 }, label: [100, 171, "Upper"] },
  { id: "lips", shape: { kind: "rect", x: 76, y: 175, w: 48, h: 8, r: 4 } },
  { id: "teeth-lower", shape: { kind: "rect", x: 76, y: 184, w: 48, h: 14, r: 5 }, label: [100, 195, "Lower"] },
  { id: "jaw-right", shape: { kind: "path", d: "M52 158h22v48c-12-6-20-24-22-48z" }, label: [63, 186, "Jaw"] },
  { id: "jaw-left", shape: { kind: "path", d: "M148 158h-22v48c12-6 20-24 22-48z" }, label: [137, 186, "Jaw"] },
  { id: "gums-mouth", shape: { kind: "path", d: "M78 200h44c-4 14-14 20-22 20s-18-6-22-20z" }, label: [100, 214, "Mouth"] },
  { id: "throat", shape: { kind: "rect", x: 80, y: 228, w: 40, h: 34, r: 8 }, label: [100, 250, "Throat"] },
];

function Shape({ p, on, onPick }: { p: Part; on: boolean; onPick: () => void }) {
  const name = p.id === "@face" ? "Face, teeth and jaw (zoom in)" : regionById(p.id)?.label ?? p.id;
  const common = {
    className: `part${on ? " on" : ""}`,
    role: "button",
    tabIndex: 0,
    "aria-label": name,
    "aria-pressed": p.id === "@face" ? undefined : on,
    onClick: onPick,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPick();
      }
    },
  };
  const s = p.shape;
  return (
    <g>
      <title>{name}</title>
      {s.kind === "ellipse" && <ellipse {...common} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />}
      {s.kind === "rect" && <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r ?? 0} />}
      {s.kind === "path" && <path {...common} d={s.d} />}
      {p.label && (
        <text className="lbl" x={p.label[0]} y={p.label[1]}>
          {p.label[2]}
        </text>
      )}
    </g>
  );
}

const OTHER = ["gums-mouth", "bladder", "skin", "general", "mind"];

export function BodyMap({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  const [view, setView] = useState<View>("front");
  const [showList, setShowList] = useState(false);
  const parts = view === "front" ? FRONT : view === "back" ? BACK : FACE;
  const vb = view === "face" ? "20 15 160 255" : "20 4 160 384";

  return (
    <div className="stack">
      <div className="spread">
        <div className="seg" role="group" aria-label="Body view">
          {(["front", "back", "face"] as View[]).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
              {v === "face" ? "Face & teeth" : v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button type="button" className="btn ghost small" style={{ whiteSpace: "nowrap" }} onClick={() => setShowList((s) => !s)}>
          {showList ? "Hide list" : "Use a list"}
        </button>
      </div>

      {!showList && (
        <svg className="map" viewBox={vb} role="group" aria-label={`Body map, ${view} view`} style={{ maxHeight: "52dvh" }}>
          {parts.map((p) => (
            <Shape
              key={view + p.id}
              p={p}
              on={value === p.id}
              onPick={() => (p.id === "@face" ? setView("face") : onChange(p.id))}
            />
          ))}
          {view === "front" && <text className="lbl" x={100} y={398}>Your right ← → Your left</text>}
          {view === "face" && <text className="lbl" x={100} y={268}>Your right ← → Your left</text>}
        </svg>
      )}

      {showList && (
        <div className="chips" role="group" aria-label="All body areas">
          {REGIONS.map((r) => (
            <button key={r.id} type="button" className="chip" aria-pressed={value === r.id} onClick={() => onChange(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      )}

      {!showList && (
        <div className="stack">
          <p className="small muted">Not on the map?</p>
          <div className="chips">
            {OTHER.map((id) => (
              <button key={id} type="button" className="chip" aria-pressed={value === id} onClick={() => onChange(id)}>
                {regionById(id)!.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
