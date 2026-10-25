import { TopBar } from "../components/ui";
import { daysSince, feelingOf, fmtDate } from "../lib/format";
import { regionById } from "../lib/regions";
import { useData } from "../lib/store";
import type { CheckIn, Episode, Visit } from "../lib/types";

/** Design principle 5: one screen for the doctor, readable across a desk in 10 seconds. */
export function ShowDoctor() {
  const data = useData();
  const p = data.profile;
  const episodes = data.entries.filter((e): e is Episode => e.kind === "episode").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const visits = data.entries.filter((e): e is Visit => e.kind === "visit").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const checkins = data.entries.filter((e): e is CheckIn => e.kind === "checkin").sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const current = [...episodes].reverse().find((e) => !e.resolved) ?? episodes[episodes.length - 1];
  if (!current)
    return (
      <div className="stack-lg">
        <TopBar title="Show my doctor" />
        <div className="card">
          <p>Once you've logged a symptom or a visit, this page puts it all on one screen to show a doctor, dentist or pharmacist.</p>
          <a className="btn primary" href="#/intake">Log a symptom</a>
        </div>
      </div>
    );

  const sameArea = episodes.filter((e) => regionById(e.answers.regionId)?.group === regionById(current.answers.regionId)?.group);
  const first = sameArea[0];
  const relatedVisits = visits.filter((v) => !v.episodeId || sameArea.some((e) => e.id === v.episodeId));
  const lastVisit = relatedVisits[relatedVisits.length - 1] ?? visits[visits.length - 1];
  const recentMeds = visits
    .filter((v) => daysSince(v.createdAt) <= 60)
    .flatMap((v) => v.medicines.map((m) => ({ ...m, from: v.createdAt, by: v.clinician })));
  const lastFeelings = [...checkins, ...visits.filter((v) => v.feeling)].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-6);

  return (
    <div className="stack-lg doc">
      <div className="no-print">
        <TopBar title="Show my doctor" />
      </div>

      <div>
        <p className="small muted">Patient's own record · Trace · {fmtDate(new Date().toISOString())}</p>
        <h1>
          {p?.name || "Patient"} {p?.pronouns && <span className="muted" style={{ fontSize: "1.1rem", fontWeight: 400 }}>({p.pronouns})</span>}
        </h1>
      </div>

      <section className="card accent">
        <p className="small muted">Current issue</p>
        <p className="big">{regionById(current.answers.regionId)?.label ?? current.title}</p>
        <p>
          First logged <strong>{fmtDate(first.createdAt)}</strong> ({daysSince(first.createdAt)} days ago)
          {sameArea.length > 1 && <> · <strong>{sameArea.length} episodes</strong></>}
        </p>
        <p>Pain now: <strong>{current.answers.severity}/10</strong> · {current.answers.onset}</p>
        {sameArea.length > 1 && (
          <div>
            <div className="sev-bars" aria-label={`Pain scores over time: ${sameArea.map((e) => e.answers.severity).join(", ")}`}>
              {sameArea.map((e) => (
                <i key={e.id} style={{ height: `${Math.max(8, e.answers.severity * 10)}%` }} title={`${fmtDate(e.createdAt)}: ${e.answers.severity}/10`} />
              ))}
            </div>
            <p className="tiny muted">Pain score each time it was logged</p>
          </div>
        )}
        {current.answers.ownWords && <p>“{current.answers.ownWords}”</p>}
      </section>

      <section className="card">
        <h2>💊 Medicines (last 60 days)</h2>
        {recentMeds.length === 0 ? (
          <p className="muted">None recorded</p>
        ) : (
          <table>
            <thead>
              <tr><th>Medicine</th><th>Dose</th><th>How often</th><th>Started</th></tr>
            </thead>
            <tbody>
              {recentMeds.map((m, i) => (
                <tr key={i}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.dose}</td>
                  <td>{[m.frequency, m.duration && `for ${m.duration}`].filter(Boolean).join(", ")}</td>
                  <td>{fmtDate(m.from)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {lastVisit && (
        <section className="card">
          <h2>📝 Last advice: {lastVisit.clinician || "visit"}, {fmtDate(lastVisit.createdAt)}</h2>
          {lastVisit.said.length > 0 && <ul className="dots">{lastVisit.said.map((s) => <li key={s}>{s}</li>)}</ul>}
          {lastVisit.nextSteps.length > 0 && <p><strong>Next steps:</strong> {lastVisit.nextSteps.join("; ")}</p>}
        </section>
      )}

      <section className="card">
        <h2>🗓️ Timeline</h2>
        <table>
          <tbody>
            {[...sameArea, ...relatedVisits]
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
              .map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDate(e.createdAt)}</td>
                  <td>
                    {e.kind === "episode"
                      ? `Symptom logged: ${regionById(e.answers.regionId)?.label}, ${e.answers.severity}/10`
                      : `Saw ${e.clinician || "clinician"}${e.said[0] ? `: ${e.said[0]}` : ""}`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {lastFeelings.length > 0 && (
          <p>How I've felt: {lastFeelings.map((f) => feelingOf(f.feeling)?.emoji).join(" ")}</p>
        )}
      </section>

      <div className="stack no-print">
        <button className="btn primary block" onClick={() => window.print()}>🖨️ Print or save as PDF</button>
        <p className="tiny muted center">Written by the patient. Not a clinical record.</p>
      </div>
    </div>
  );
}
