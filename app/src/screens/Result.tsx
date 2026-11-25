import { TopBar } from "../components/ui";
import { fmtDate } from "../lib/format";
import { findOption, regionById } from "../lib/regions";
import { route } from "../lib/routing";
import { go } from "../lib/router";
import { useData } from "../lib/store";
import type { Episode } from "../lib/types";

/** S1: questions to bring to the appointment, generated from what the user told us. */
function questionsFor(e: Episode) {
  const q = ["What do you think is causing this?", "What should I do if it gets worse, and who should I contact?"];
  if (e.answers.onset === "It keeps coming back" || e.answers.onset === "Over a month")
    q.unshift("This keeps coming back. What else could we check?");
  if (e.answers.associated.includes("d-ear") || e.answers.associated.includes("ear-teeth"))
    q.push("The pain spreads to my ear. Could it be coming from somewhere else?");
  q.push("Will any medicine you give me interact with what I already take?", "When should I come back?");
  return q;
}

export function Result({ id }: { id: string }) {
  const data = useData();
  const e = data.entries.find((x): x is Episode => x.id === id && x.kind === "episode");
  if (!e)
    return (
      <div className="stack-lg">
        <TopBar title="Not found" />
        <p>This entry was deleted.</p>
      </div>
    );

  const r = route(e.answers, data.profile, new Date(e.createdAt));
  const region = regionById(e.answers.regionId);
  const told = e.answers.associated.map((x) => findOption(x)?.label).filter(Boolean);

  if (e.redFlag)
    return (
      <div className="stack-lg">
        <TopBar title="Emergency logged" back="/timeline" />
        <div className="card alarm">
          <h2>⚠️ {e.redFlag}</h2>
          <p>You reported a warning sign on {fmtDate(e.createdAt, true)}. If you haven't already, get help now.</p>
          <a className="btn danger block" href="tel:112">📞 Call 112</a>
        </div>
      </div>
    );

  return (
    <div className="stack-lg">
      <TopBar title="Where to go" />

      <div className="card accent">
        <p className="small muted">For your {region?.label.toLowerCase()}, I'd suggest:</p>
        <div className="door">
          <span className="ico" aria-hidden="true">{r.door.icon}</span>
          <div>
            <h2 style={{ fontSize: "1.6rem" }}>{r.door.name}</h2>
            <span className="pill accent">{r.urgency}</span>
          </div>
        </div>
        {r.outOfHours && <p className="small">🌙 It's outside normal surgery hours, so I've taken that into account.</p>}
      </div>

      <section className="stack">
        <h2>Why</h2>
        <ul className="dots">
          {r.why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>💶 What it might cost</h3>
        <p>{r.door.cost}</p>
        {r.entitlements.map((en) => (
          <p key={en.text} className="small">
            ✅ {en.text} {en.source && <a href={en.source.url} target="_blank" rel="noreferrer">Source</a>}
          </p>
        ))}
        {!data.profile?.ageBand && !data.profile?.medicalCard && (
          <a className="small" href="#/settings">Add your age or cards to see what's free for you →</a>
        )}
      </section>

      <section className="card">
        <h3>📍 What to do</h3>
        <p>{r.door.howTo}</p>
        {r.door.mapsQuery && (
          <a className="btn block" href={`https://www.google.com/maps/search/${encodeURIComponent(r.door.mapsQuery + " near me")}`} target="_blank" rel="noreferrer">
            Find a {r.door.short.toLowerCase()} near me ↗
          </a>
        )}
        {r.alsoConsider && <p className="small muted">Also worth considering: {r.alsoConsider.icon} {r.alsoConsider.name}.</p>}
      </section>

      <section className="card warn">
        <h3>⚠️ Watch out for</h3>
        <ul className="dots small">
          {r.safetyNet.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="stack">
        <h2>Questions to ask</h2>
        <ol className="dots" style={{ listStyle: "decimal" }}>
          {questionsFor(e).map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>

      <details className="card">
        <summary style={{ fontWeight: 700, cursor: "pointer" }}>What you told me</summary>
        <p className="small">
          <strong>Where:</strong> {region?.label} · <strong>Started:</strong> {e.answers.onset} · <strong>Pain:</strong> {e.answers.severity}/10
        </p>
        {e.answers.ownWords && <p className="small">“{e.answers.ownWords}”</p>}
        {told.length > 0 && <p className="small"><strong>Also:</strong> {told.join("; ")}</p>}
        {e.answers.modifiers.length > 0 && <p className="small"><strong>Affected by:</strong> {e.answers.modifiers.join(", ")}</p>}
      </details>

      {r.door.sources.length > 0 && (
        <p className="tiny muted">
          Sources:{" "}
          {r.door.sources.map((s, n) => (
            <span key={s.url}>
              {n > 0 && " · "}
              <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
            </span>
          ))}
        </p>
      )}
      <p className="tiny muted">{r.disclaimer}</p>

      <div className="stack no-print">
        <a className="btn primary block" href={`#/recap?episode=${e.id}`}>🎙️ After the visit: log what they said</a>
        <button className="btn block" onClick={() => go("/")}>Saved. Back to home.</button>
      </div>
    </div>
  );
}
