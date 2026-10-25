import { useEffect, useRef, type ReactNode } from "react";
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
          <a className="btn outline block" href="https://www.google.com/maps/search/emergency+department+near+me" target="_blank" rel="noreferrer">
            🏥 Find my nearest ED
          </a>
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
  { to: "/doctor", ico: "🩺", label: "Show doctor" },
  { to: "/settings", ico: "🔒", label: "Privacy" },
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
