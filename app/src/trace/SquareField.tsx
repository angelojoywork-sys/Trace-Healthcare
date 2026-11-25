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
    const n = Math.sin(x * 5 + t * 0.5) * Math.sin(y * 4 - t * 0.38) * 0.5 + Math.sin(x * 11 - y * 7 + t * 0.24) * 0.25;
    return top * 0.8 + n * 0.22 * (1 - y * 0.6) + 0.02;
  };
  return <SquareCanvas density={density} cell={12} colorVar="--pixel" alpha={0.55} fps={10} className="pointer-events-none absolute inset-0 -z-10 size-full" />;
}

const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const mixc = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

/**
 * Severity 1 to 10 as a ball made of small squares, in the middle of the screen. At 1 it is a faint, calm sphere.
 * As the number rises the ball fills in, the squares flicker faster, its edge turns ragged and a warm tint creeps in.
 */
export function SeverityBall({ level }: { level: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  levelRef.current = level;

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = getComputedStyle(el).getPropertyValue("--pixel-strong").trim() || "#9fa8da";
    const m = /^#?([0-9a-f]{6})$/i.exec(base);
    const n0 = m ? parseInt(m[1], 16) : 0x9fa8da;
    const br = (n0 >> 16) & 255, bg = (n0 >> 8) & 255, bb = n0 & 255;
    const L = (() => { const v = [-0.45, -0.55, 0.7], k = Math.hypot(v[0], v[1], v[2]); return v.map((x) => x / k); })();
    const cell = 10;
    let w = 0, h = 0, dpr = 1, timer = 0, s = (levelRef.current - 1) / 9, last = performance.now();

    const draw = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.5);
      last = now;
      const target = (levelRef.current - 1) / 9;
      s = reduce ? target : s + (target - s) * (1 - Math.exp(-dt * 3));
      const t = now / 1000;
      const bucket = Math.floor(t * (0.4 + 5 * s)); // how often the squares re-roll: a slow shimmer at 1, a flicker at 10
      const R = Math.min(w, h) * 0.38, cx = w / 2, cy = h / 2;
      const warm = Math.max(0, Math.min(1, (s - 0.55) / 0.45)) * 0.45;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgb(${mixc(br, 255, warm)},${mixc(bg, 138, warm)},${mixc(bb, 101, warm)})`;
      ctx.globalAlpha = 0.85;
      const i0 = Math.floor((cx - R * 1.4) / cell), i1 = Math.ceil((cx + R * 1.4) / cell);
      const j0 = Math.floor((cy - R * 1.4) / cell), j1 = Math.ceil((cy + R * 1.4) / cell);
      for (let j = j0; j < j1; j++) {
        for (let i = i0; i < i1; i++) {
          const x = (i + 0.5) * cell - cx, y = (j + 0.5) * cell - cy;
          const th = Math.atan2(y, x);
          const edge = R * (1 + s * 0.3 * (vnoise(Math.cos(th) * 1.6 + 5, Math.sin(th) * 1.6 + t * 0.5) - 0.5) * 2);
          const nx = x / edge, ny = y / edge, rr = nx * nx + ny * ny;
          if (rr >= 1) continue;
          const lam = Math.max(0, nx * L[0] + ny * L[1] + Math.sqrt(1 - rr) * L[2]);
          const shade = 0.2 + 0.8 * lam;
          const d = shade * (0.12 + 0.88 * s) + (vnoise(i * 0.35 + t * 0.4, j * 0.35 - t * 0.3) - 0.5) * 0.5 * s;
          if (hash(i + bucket * 7.31, j + bucket * 3.17) >= d) continue;
          const size = Math.max(2, cell * (0.32 + 0.5 * Math.min(1, d)));
          const jit = (hash(i * 1.7 + bucket, j * 2.3) - 0.5) * s * cell * 0.4;
          ctx.fillRect(cx + x - size / 2 + jit, cy + y - size / 2 - jit, size, size);
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
    if (!reduce) timer = window.setInterval(() => { if (!document.hidden) draw(); }, 1000 / 14);
    return () => { window.clearInterval(timer); ro.disconnect(); };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="size-full" />;
}
