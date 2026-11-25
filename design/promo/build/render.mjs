// node render.mjs stills out/ t1 t2 ...   |   node render.mjs video out.mp4 [--fps 24] [--scale 1]
// Serves this folder, drives headless Chromium frame by frame (window.renderAt) and pipes frames to ffmpeg.
import { createRequire } from 'node:module'; import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn, execSync } from 'node:child_process'; import { dirname, join, extname, resolve } from 'node:path'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'));
const ROOT = dirname(fileURLToPath(import.meta.url)); const a = process.argv.slice(2); const flag = (n, d) => { const i = a.indexOf(n); if (i < 0) return d; const v = a[i + 1]; a.splice(i, 2); return v; };
const FPS = +flag('--fps', 24), SCALE = +flag('--scale', 1), FROM = +flag('--from', 0), TO = +flag('--to', 1e9); const [mode, out, ...rest] = a;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = createServer((q, r) => { const p = join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !existsSync(p) || statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const url = `http://127.0.0.1:${srv.address().port}/index.html?t=0&scale=${SCALE}`;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const pg = await b.newPage({ viewport: { width: 540, height: 960 } }); pg.on('pageerror', e => console.error('PAGE ERROR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
await pg.goto(url); await pg.evaluate('window.ready');
const grab = async t => pg.evaluate(async t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }, t);
if (mode === 'stills') { mkdirSync(out, { recursive: true }); for (const t of rest.map(Number)) writeFileSync(join(out, `${t.toFixed(2).padStart(5, '0')}.jpg`), Buffer.from(await grab(t), 'base64')); console.log('stills ->', out); }
else {
  const n = Math.round(20 * FPS), ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', resolve(out)], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now(); for (let f = 0; f < n; f++) { const buf = Buffer.from(await grab(f / FPS), 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 24 === 0) process.stdout.write(`\r${f}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('\nSAVED', out);
}
await b.close(); srv.close();
