import { useEffect, useMemo, useRef } from "react";

const N = 150; // letters at the highest severity
const TURNS = 1.3;
const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
const rand = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type Props = {
  /** The word whose letters make the helix (the severity label). */
  word: string;
  /** 0 (very mild) to 4 (very severe). The higher it is, the more the letters scatter and jitter. */
  level: number;
};

/**
 * Letters that build up with severity. Very mild is light: a few faint letters loosely suggesting a spiral,
 * drifting slowly. As severity rises more letters appear, they get bigger and brighter, move faster, scatter
 * further and warm in colour. Nothing snaps: every change eases. Plain 2D canvas, no WebGL.
 */
export function LetterHelix({ word, level }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  const wordRef = useRef(word.replace(/\s+/g, "").toUpperCase() || "TRACE");
  levelRef.current = level;
  wordRef.current = word.replace(/\s+/g, "").toUpperCase() || "TRACE";

  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ a: rand(i * 3 + 1), b: rand(i * 3 + 2), c: rand(i * 3 + 3), d: rand(i * 5 + 9) })), []);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, last = performance.now(), sEased = levelRef.current / 4, rot = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
    };
    const ro = new ResizeObserver(() => { resize(); draw(performance.now(), 0); });
    ro.observe(el);
    resize();

    function draw(now: number, dt: number) {
      const target = levelRef.current / 4;
      sEased = reduce ? target : sEased + (target - sEased) * (1 - Math.exp(-dt * 2.2));
      const s = sEased;
      if (!reduce) rot += dt * (0.18 + 0.7 * s);
      const t = now / 1000;
      const letters = wordRef.current;
      const R = Math.min(w, h) * 0.2;
      const Hh = h * 0.44;
      const shown = 0.2 + 0.8 * s; // share of the letters that exist at this severity
      const loose = 0.55 + 1.9 * s; // how far letters sit from the faint spiral
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      const M = N / 2;
      for (let i = 0; i < N; i++) {
        const sd = seeds[i];
        const vis = smooth((shown - sd.d) / 0.12); // letters fade in one by one as severity rises
        if (vis <= 0.01) continue;
        const strand = i % 2, k = i >> 1;
        const u = (k / (M - 1)) * 2 - 1;
        const th = u * TURNS * 2 * Math.PI + strand * Math.PI + rot;
        const r = R * (1 + s * 1.2 * sd.a);
        const x = r * Math.cos(th), z = r * Math.sin(th), y = u * Hh;
        const sx = (sd.b - 0.5) * 2 * loose * R;
        const sy = (sd.c - 0.5) * 2 * loose * R * 0.7;
        const drift = (0.12 + 0.12 * s) * R, spd = reduce ? 0 : 0.4 + 1.2 * s;
        const dx = Math.sin(t * spd + sd.b * 6.28) * drift;
        const dy = Math.cos(t * spd * 0.8 + sd.c * 6.28) * drift * 0.8;
        const jit = reduce ? 0 : s * s * 6;
        const jx = Math.sin(t * (2 + sd.a * 4) + sd.c * 6.28) * jit;
        const jy = Math.cos(t * (2 + sd.b * 4) + sd.a * 6.28) * jit;
        const persp = 1 / (1 - z / (R * 6));
        const px = w / 2 + (x + sx + dx + jx) * persp;
        const py = h / 2 + (y + sy + dy + jy) * persp;
        const depth = (z / r + 1) / 2;
        const warm = Math.min(1, Math.max(0, (s - 0.25) * 1.5 * (0.4 + sd.b)));
        const cr = Math.round(mix(100, 255, warm)), cg = Math.round(mix(255, 138, warm)), cb = Math.round(mix(218, 101, warm));
        const alpha = (0.22 + 0.78 * depth) * (0.4 + 0.6 * s) * vis;
        ctx!.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx!.font = `${Math.round((9 + 7 * depth) * (0.85 + 0.35 * s) * (0.9 + 0.3 * persp))}px "Geist Mono Variable", ui-monospace, monospace`;
        ctx!.fillText(letters[(k * 2 + strand) % letters.length], px, py);
      }
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(loop);
    };
    if (reduce) { draw(performance.now(), 0); } else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [seeds]);

  return <canvas ref={canvas} aria-hidden="true" className="size-full" />;
}
