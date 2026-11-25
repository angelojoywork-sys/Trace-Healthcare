import { useEffect, useRef, useState, type ReactNode } from "react";
import { go, useRoute } from "../lib/router";
import { speechSupported, useDictation } from "../lib/speech";

export function Logo() {
  return (
    <span className="brand">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="var(--accent)" />
        <path d="M14 38c6 0 8-14 14-14s6 16 12 16 6-10 10-10" fill="none" stroke="var(--accent-ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Trace
    </span>
  );
}

export function TopBar({ title, back = "/" }: { title: string; back?: string | (() => void) }) {
  return (
    <div className="topbar">
      <button className="back" aria-label="Back" onClick={() => (typeof back === "function" ? back() : go(back))}>
        ←
      </button>
      <h1>{title}</h1>
    </div>
  );
}

/** Textarea with an optional microphone. Final speech is appended; the user can always edit. */
export function VoiceText({
  value,
  onChange,
  placeholder,
  label,
  rows = 4,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
  rows?: number;
  autoFocus?: boolean;
}) {
  const latest = useRef(value);
  latest.current = value;
  const d = useDictation((t) => onChange((latest.current ? latest.current.trimEnd() + " " : "") + t));
  const canSpeak = speechSupported();
  return (
    <div className="stack">
      <label className="field">
        <span className="sr-only">{label}</span>
        <textarea
          value={d.interim ? `${value} ${d.interim}`.trim() : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          autoFocus={autoFocus}
          aria-label={label}
          readOnly={d.listening}
        />
      </label>
      {canSpeak && (
        <button type="button" className="btn mic block" aria-pressed={d.listening} onClick={d.toggle}>
          <span aria-hidden="true">🎙️</span> {d.listening ? "Listening… tap to stop" : "Speak instead"}
        </button>
      )}
      {d.error && <p className="small" role="alert">{d.error}</p>}
    </div>
  );
}

/** Design principle 3: safety interrupts everything. */
export function RedFlagScreen({ reason, onSafe }: { reason: string; onSafe: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const mind = /support/i.test(reason);
  return (
    <div className="takeover" role="alertdialog" aria-modal="true" aria-labelledby="rf-title">
      <div className="inner">
        <p style={{ fontSize: "3rem", margin: 0 }} aria-hidden="true">⚠️</p>
        <h1 id="rf-title" ref={ref} tabIndex={-1}>
          {mind ? "Please reach out now" : "Get help now"}
        </h1>
        <p style={{ fontSize: "1.2rem" }}>
          <strong>{reason}.</strong>{" "}
          {mind
            ? "You don't have to go through this alone. If you're in danger right now, call 112 or 999."
            : "This could be serious. Don't wait for an appointment."}
        </p>
        <a className="btn call block" href="tel:112">📞 Call 112</a>
        <a className="btn outline block" href="tel:999">Call 999</a>
        {mind && (
          <a className="btn outline block" href="tel:116123">Samaritans · 116 123 (free, 24/7)</a>
        )}
        {!mind && (
          <NearMe query="emergency department" label="🏥 Find my nearest ED" className="btn outline block" />
        )}
        <p className="small">
          112 and 999 both reach the emergency services in Ireland, and they're free from any phone.
        </p>
        <button className="btn outline block" onClick={onSafe}>
          I've called, or I'm safe. Save this and go back.
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { to: "/", ico: "🏠", label: "Home" },
  { to: "/timeline", ico: "🗓️", label: "Timeline" },
  { to: "/doctor", ico: "🩺", label: "Doctor" },
];

export function TabBar() {
  const { path } = useRoute();
  return (
    <div className="tabs no-print">
      <nav aria-label="Main">
        {TABS.map((t) => (
          <a key={t.to} href={"#" + t.to} aria-current={path === t.to ? "page" : undefined}>
            <span className="ico" aria-hidden="true">{t.ico}</span>
            {t.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

export function Disclaimer() {
  return (
    <p className="banner">
      Trace is a prototype. It isn't a diagnostic tool and doesn't replace a clinician. In an emergency, call <a href="tel:112">112</a> or <a href="tel:999">999</a>.
    </p>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="stack">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** Opens Google Maps around the user's real position. Falls back to a plain search if location is denied. */
export function NearMe({ query, label, className = "btn block" }: { query: string; label: string; className?: string }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const open = (w: Window | null, near: string) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}${near}`;
    if (w) w.location.href = url;
    else window.open(url, "_blank", "noopener");
  };
  const onClick = () => {
    // Open the tab now (inside the tap) so browsers don't block it after the async location lookup.
    const w = window.open("", "_blank");
    if (!navigator.geolocation) {
      open(w, "+near+me");
      return;
    }
    setBusy(true);
    setMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        open(w, `/@${pos.coords.latitude},${pos.coords.longitude},14z`);
      },
      () => {
        setBusy(false);
        setMsg("Couldn't get your location. Allow location for this site in your browser settings, or search by area.");
        open(w, "+near+me");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  return (
    <div className="stack">
      <button type="button" className={className} onClick={onClick} disabled={busy}>
        {busy ? "Finding you…" : `${label} ↗`}
      </button>
      {msg && <p className="small" role="status">{msg}</p>}
    </div>
  );
}

const FB_KEY = "trace.feedback";
/** Distinct, attention-grabbing prompt. Answers stay on this device (see the note under the form). */
export function Feedback() {
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return <div className="card feedback"><p><strong>Thank you.</strong> That helps make Trace easier.</p></div>;
  return (
    <section className="card feedback" aria-labelledby="fb-h">
      <h3 id="fb-h">How easy was that to log?</h3>
      <div className="scale five" role="group" aria-label="Ease from 1 (hard) to 5 (easy)">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-pressed={score === n} onClick={() => setScore(n)}>{n}</button>
        ))}
      </div>
      <div className="spread tiny"><span>1 · Hard</span><span>5 · Easy</span></div>
      <input type="text" aria-label="Anything we should change? (optional)" placeholder="Anything we should change? (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <button
        type="button"
        className="btn primary"
        disabled={!score}
        onClick={() => {
          try {
            const all = JSON.parse(localStorage.getItem(FB_KEY) ?? "[]");
            all.push({ at: new Date().toISOString(), score, note: note.trim() });
            localStorage.setItem(FB_KEY, JSON.stringify(all));
          } catch { /* storage blocked */ }
          setSent(true);
        }}
      >
        Send
      </button>
      <p className="tiny">Your answer is stored only on this device. It isn't sent anywhere.</p>
    </section>
  );
}
