import { TopBar } from "../components/ui";
import { feelingOf, fmtDate } from "../lib/format";
import { regionById } from "../lib/regions";
import { DOORS } from "../lib/routing";
import { removeEntry, useData } from "../lib/store";
import type { Entry } from "../lib/types";

function Item({ e }: { e: Entry }) {
  const del = () => confirm("Delete this entry?") && removeEntry(e.id);
  if (e.kind === "episode")
    return (
      <div className="tl-item episode">
        <div className={`card${e.redFlag ? " alarm" : ""}`}>
          <div className="spread">
            <a href={`#/result?id=${e.id}`} style={{ fontWeight: 700 }}>
              {e.redFlag ? "⚠️ " : ""}
              {regionById(e.answers.regionId)?.label ?? e.title}
            </a>
            <span className="tiny muted">{fmtDate(e.createdAt, true)}</span>
          </div>
          <p className="small">
            Pain {e.answers.severity}/10 · {e.answers.onset} · {e.redFlag ?? `${DOORS[e.door].icon} ${DOORS[e.door].short}`}
          </p>
          {e.answers.ownWords && <p className="small muted">“{e.answers.ownWords}”</p>}
          <button className="btn ghost tiny no-print" style={{ alignSelf: "flex-end", minHeight: 32, padding: "0.2rem 0.5rem" }} onClick={del}>Delete</button>
        </div>
      </div>
    );
  if (e.kind === "visit")
    return (
      <div className="tl-item visit">
        <div className="card">
          <div className="spread">
            <strong>🩺 {e.clinician || "Visit"}</strong>
            <span className="tiny muted">{fmtDate(e.createdAt, true)}</span>
          </div>
          {e.said.length > 0 && <p className="small">{e.said.join(" · ")}</p>}
          {e.medicines.length > 0 && (
            <p className="small">💊 {e.medicines.map((m) => [m.name, m.dose, m.frequency].filter(Boolean).join(" ")).join("; ")}</p>
          )}
          {e.nextSteps.length > 0 && <p className="small muted">Next: {e.nextSteps.join(" · ")}</p>}
          {e.feeling && <p className="small">{feelingOf(e.feeling)?.emoji} {e.feelingNote || feelingOf(e.feeling)?.label}</p>}
          <button className="btn ghost tiny no-print" style={{ alignSelf: "flex-end", minHeight: 32, padding: "0.2rem 0.5rem" }} onClick={del}>Delete</button>
        </div>
      </div>
    );
  return (
    <div className="tl-item checkin">
      <p className="small" style={{ padding: "0.6rem 0" }}>
        {feelingOf(e.feeling)?.emoji} Felt {feelingOf(e.feeling)?.label.toLowerCase()}
        {e.note ? `: ${e.note}` : ""} <span className="tiny muted">· {fmtDate(e.createdAt)}</span>
      </p>
    </div>
  );
}

export function Timeline() {
  const data = useData();
  const entries = [...data.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="stack-lg">
      <TopBar title="Timeline" />
      {entries.length === 0 ? (
        <div className="card">
          <p>Nothing here yet. When you log a symptom, a visit or how you're feeling, it shows up here in order. That's your story, in your own words.</p>
          <a className="btn primary" href="#/intake">Log a symptom</a>
        </div>
      ) : (
        <div className="tl">
          {entries.map((e) => (
            <Item key={e.id} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}
