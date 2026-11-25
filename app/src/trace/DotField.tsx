import { useEffect, useMemo, useRef } from "react";

const N = 280;
const rand = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };

function accentRgb(el: HTMLElement): [number, number, number] {
  const v = getComputedStyle(el).getPropertyValue("--highlight").trim();
  const m = /^#?([0-9a-f]{6})$/i.exec(v);
  if (!m) return [100, 255, 218];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * A soft field of dots that fills in from the right as severity rises (1 to 10): a few faint dots at 1,
 * a dense drift at 10. Slow and quiet on purpose. Uses the accent colour from the theme. Plain 2D canvas.
 */
export function DotField({ level }: { level: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  levelRef.current = level;
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ u: Math.pow(rand(i * 3 + 1), 1.7), y: rand(i * 3 + 2), p: rand(i * 3 + 3) })), []);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [r, g, b] = accentRgb(el);
    let w = 0, h = 0, dpr = 1, raf = 0, last = performance.now();
    let s = (levelRef.current - 1) / 9;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
    };
    const ro = new ResizeObserver(() => { resize(); draw(performance.now(), 0); });
    ro.observe(el);
    resize();

    function draw(now: number, dt: number) {
      const target = (levelRef.current - 1) / 9;
      s = reduce ? target : s + (target - s) * (1 - Math.exp(-dt * 3));
      const t = now / 1000;
      const reach = 0.1 + 0.9 * s; // how far the dots have spread from the right edge
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      for (const d of seeds) {
        const vis = smooth((reach - d.u) / 0.15);
        if (vis <= 0.01) continue;
        const drift = reduce ? 0 : 5 + 5 * s;
        const x = w * (1 - d.u) + Math.sin(t * 0.35 + d.p * 6.28) * drift;
        const y = d.y * h + Math.cos(t * 0.3 + d.p * 6.28) * drift;
        const rad = (3 + 5 * (1 - d.u)) * (0.75 + 0.45 * s);
        ctx!.fillStyle = `rgba(${r},${g},${b},${(0.18 + 0.5 * (1 - d.u)) * vis})`;
        ctx!.beginPath();
        ctx!.arc(x, y, rad, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(loop);
    };
    if (reduce) draw(performance.now(), 0); else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [seeds]);

  return <canvas ref={canvas} aria-hidden="true" className="size-full" />;
}
