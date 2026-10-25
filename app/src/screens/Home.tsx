import { Disclaimer, Logo } from "../components/ui";
import { daysUntil, downloadIcs, feelingOf, FEELINGS, fmtDate, relDay } from "../lib/format";
import { regionById } from "../lib/regions";
import { DOORS } from "../lib/routing";
import { addEntry, uid, updateEntry, useData } from "../lib/store";
import type { CheckIn, Episode, Visit } from "../lib/types";

export function Home() {
  const data = useData();
  const name = data.profile?.name;
  const open = data.entries.filter((e): e is Episode => e.kind === "episode" && !e.resolved && !e.redFlag).reverse();
  const followUps = data.entries
    .filter((e): e is Visit => e.kind === "visit" && !!e.followUpDate && daysUntil(e.followUpDate) >= -3)
    .sort((a, b) => a.followUpDate!.localeCompare(b.followUpDate!));
  const todayCheck = data.entries.find((e): e is CheckIn => e.kind === "checkin" && new Date(e.createdAt).toDateString() === new Date().toDateString());

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="stack-lg">
      <div className="spread">
        <Logo />
        <a className="small" href="tel:112">Emergency? 112</a>
      </div>
      <h1>
        {greet}
        {name ? `, ${name}` : ""}.
      </h1>

      <div className="stack">
        <a className="btn primary big block" href="#/intake">
          <span className="ico" aria-hidden="true">🫶</span>
          <span>
            Something's wrong
            <span className="sub">Tell me where it hurts, and I'll help you find the right door</span>
          </span>
        </a>
        <a className="btn big block" href="#/recap">
          <span className="ico" aria-hidden="true">🎙️</span>
          <span>
            I just had an appointment
            <span className="sub">Say what they told you, and I'll make a summary</span>
          </span>
        </a>
        <a className="btn big block" href="#/doctor">
          <span className="ico" aria-hidden="true">🩺</span>
          <span>
            Show my doctor
            <span className="sub">Everything on one screen</span>
          </span>
        </a>
      </div>

      <section className="card" aria-labelledby="checkin-h">
        <h2 id="checkin-h" style={{ fontSize: "1.1rem" }}>How are you feeling today?</h2>
        {todayCheck ? (
          <p className="muted">
            {feelingOf(todayCheck.feeling)?.emoji} Logged: {feelingOf(todayCheck.feeling)?.label}. Thanks.
          </p>
        ) : (
          <div className="row" style={{ justifyContent: "space-between" }}>
            {FEELINGS.map((f) => (
              <button
                key={f.value}
                className="chip"
                style={{ fontSize: "1.5rem", padding: "0.4rem 0.6rem" }}
                aria-label={f.label}
                title={f.label}
                onClick={() => addEntry({ id: uid(), kind: "checkin", createdAt: new Date().toISOString(), feeling: f.value })}
              >
                {f.emoji}
              </button>
            ))}
          </div>
        )}
      </section>

      {followUps.length > 0 && (
        <section className="stack" aria-labelledby="fu-h">
          <h2 id="fu-h">Coming up</h2>
          {followUps.map((v) => (
            <div key={v.id} className={`card ${daysUntil(v.followUpDate!) <= 1 ? "warn" : ""}`}>
              <div className="spread">
                <strong>Follow-up {relDay(v.followUpDate!)}</strong>
                <span className="pill">{fmtDate(v.followUpDate!)}</span>
              </div>
              <p className="small">{v.followUpNote || `Follow-up with ${v.clinician || "your clinician"}`}</p>
              <button
                className="btn small"
                onClick={() => downloadIcs(v.followUpDate!, `Follow-up: ${v.clinician || "appointment"}`, v.followUpNote ?? "")}
              >
                📅 Add to my calendar
              </button>
            </div>
          ))}
        </section>
      )}

      {open.length > 0 && (
        <section className="stack" aria-labelledby="open-h">
          <h2 id="open-h">What you're tracking</h2>
          {open.map((e) => (
            <div key={e.id} className="card">
              <div className="spread">
                <a href={`#/result?id=${e.id}`} style={{ fontWeight: 700 }}>
                  {regionById(e.answers.regionId)?.label ?? e.title}
                </a>
                <span className="pill">{DOORS[e.door].icon} {DOORS[e.door].short}</span>
              </div>
              <p className="small muted">
                Started {fmtDate(e.createdAt)} · pain {e.answers.severity}/10
              </p>
              <div className="row">
                <a className="btn small" href={`#/recap?episode=${e.id}`}>Log a visit</a>
                <button className="btn ghost small" onClick={() => updateEntry(e.id, { resolved: true })}>
                  It's better ✓
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <Disclaimer />
    </div>
  );
}
