import { useEffect, useRef } from "react";

const hash = (i: number, j: number) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Props = {
  /** How likely a square is at a spot (0 to 1), given its position (0 to 1 across, 0 to 1 down) and time in seconds. */
  density: (x: number, y: number, t: number) => number;
  cell: number;
  /** CSS variable holding the square colour. */
  colorVar: string;
  alpha?: number;
  /** Redraws per second. Low on purpose: the movement should be hardly noticeable. */
  fps?: number;
  className?: string;
};

/** A grid of small squares that come and go by density, like a dithered gradient. Plain 2D canvas. */
function SquareCanvas({ density, cell, colorVar, alpha = 0.6, fps = 6, className }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const densityRef = useRef(density);
  densityRef.current = density;

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = getComputedStyle(el).getPropertyValue(colorVar).trim() || "#c5cae9";
    let w = 0, h = 0, dpr = 1, timer = 0;

    const draw = () => {
      const t = performance.now() / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const d = clamp01(densityRef.current((i + 0.5) / cols, (j + 0.5) / rows, t));
          if (hash(i, j) >= d) continue;
          const size = Math.max(2, Math.round(cell * (0.34 + 0.4 * d)));
          const off = (cell - size) / 2;
          ctx.fillRect(i * cell + off, j * cell + off, size, size);
        }
      }
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    if (!reduce) timer = window.setInterval(() => { if (!document.hidden) draw(); }, 1000 / fps);
    return () => { window.clearInterval(timer); ro.disconnect(); };
  }, [cell, colorVar, alpha, fps]);

  return <canvas ref={canvas} aria-hidden="true" className={className ?? "size-full"} />;
}

/** The quiet pattern behind every screen: denser at the top, thinning out towards the bottom, drifting very slowly. */
export function PixelBackground() {
  const density = (x: number, y: number, t: number) => {
    // Denser in the top corner, nearly gone by the middle, so text stays easy to read.
    const top = Math.pow(Math.max(0, 1 - y * 1.25), 1.6) * (0.55 + 0.45 * x);
    const n = Math.sin(x * 5 + t * 0.15) * Math.sin(y * 4 - t * 0.11) * 0.5 + Math.sin(x * 11 - y * 7 + t * 0.07) * 0.25;
    return top * 0.8 + n * 0.1 * (1 - y) + 0.015;
  };
  return <SquareCanvas density={density} cell={12} colorVar="--pixel" alpha={0.55} fps={5} className="pointer-events-none absolute inset-0 -z-10 size-full" />;
}

/** Severity 1 to 10. A few faint squares at 1; the pattern fills in from the right and gets denser as the number rises. */
export function SeverityField({ level }: { level: number }) {
  const target = useRef((level - 1) / 9);
  target.current = (level - 1) / 9;
  const eased = useRef(target.current);
  const last = useRef(performance.now());
  const density = (x: number, y: number, t: number) => {
    const now = performance.now();
    const dt = Math.min((now - last.current) / 1000, 0.5);
    if (dt > 0.001) { last.current = now; eased.current += (target.current - eased.current) * (1 - Math.exp(-dt * 3)); }
    const s = eased.current;
    const reach = 0.12 + 0.88 * s;
    const edge = clamp01((reach - (1 - x)) / 0.8);
    const wobble = 0.85 + 0.15 * Math.sin(y * 6 + t * 0.4 + x * 3);
    const soft = 0.35 + 0.65 * Math.sin(Math.PI * y); // feather the top and bottom
    return edge * (0.3 + 0.7 * s) * wobble * soft;
  };
  return <SquareCanvas density={density} cell={11} colorVar="--pixel-strong" alpha={0.85} fps={8} />;
}
