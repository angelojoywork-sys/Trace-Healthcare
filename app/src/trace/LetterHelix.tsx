import { useEffect, useMemo, useRef } from "react";

const N = 140; // letters
const TURNS = 1.3;
const rand = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type Props = {
  /** The word whose letters make the helix (the severity label). */
  word: string;
  /** 0 (very mild) to 4 (very severe). The higher it is, the more the letters scatter and jitter. */
  level: number;
};

/**
 * A helix made of letters. At very mild it is a calm, tight spiral; as severity rises the letters
 * drift away from it, fan outwards and jitter. Plain 2D canvas, no WebGL, so it cannot fail like the 3D body can.
 */
export function LetterHelix({ word, level }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  const wordRef = useRef(word.replace(/\s+/g, "").toUpperCase() || "TRACE");
  levelRef.current = level;
  wordRef.current = word.replace(/\s+/g, "").toUpperCase() || "TRACE";

  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ a: rand(i * 3 + 1), b: rand(i * 3 + 2), c: rand(i * 3 + 3) })), []);

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
      sEased = reduce ? target : sEased + (target - sEased) * (1 - Math.exp(-dt * 3));
      if (!reduce) rot += dt * 0.5;
      const s = sEased;
      const t = now / 1000;
      const letters = wordRef.current;
      const R = Math.min(w, h) * 0.2;
      const Hh = h * 0.44;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      const M = N / 2;
      for (let i = 0; i < N; i++) {
        const strand = i % 2, k = i >> 1, sd = seeds[i];
        const u = (k / (M - 1)) * 2 - 1;
        const th = u * TURNS * 2 * Math.PI + strand * Math.PI + rot;
        const r = R * (1 + s * 1.7 * sd.a);
        const x = r * Math.cos(th), z = r * Math.sin(th);
        const y = u * Hh;
        const sx = (sd.b - 0.5) * 2 * s * R * 2.2;
        const sy = (sd.c - 0.5) * 2 * s * R * 1.2;
        const jit = reduce ? 0 : s * 5;
        const jx = Math.sin(t * (1.5 + sd.a * 3) + sd.c * 6.28) * jit;
        const jy = Math.cos(t * (1.2 + sd.b * 3) + sd.a * 6.28) * jit;
        const persp = 1 / (1 - z / (R * 6));
        const px = w / 2 + (x + sx + jx) * persp;
        const py = h / 2 + (y + sy + jy) * persp;
        const depth = (z / r + 1) / 2; // 0 far, 1 near
        const warm = Math.min(1, Math.max(0, s * sd.b * 1.5 - 0.15));
        const cr = Math.round(mix(100, 255, warm)), cg = Math.round(mix(255, 138, warm)), cb = Math.round(mix(218, 101, warm));
        ctx!.fillStyle = `rgba(${cr},${cg},${cb},${(0.25 + 0.75 * depth) * (1 - 0.25 * s * sd.a)})`;
        ctx!.font = `${Math.round((11 + 6 * depth) * (0.9 + 0.3 * persp))}px "Geist Mono Variable", ui-monospace, monospace`;
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

  // With reduced motion there is no loop, so redraw when the level or word changes.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) canvas.current?.dispatchEvent(new Event("redraw"));
  }, [level, word]);

  return <canvas ref={canvas} aria-hidden="true" className="size-full" />;
}
