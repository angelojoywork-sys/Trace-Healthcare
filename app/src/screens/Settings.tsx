import { useState } from "react";
import { ProfileForm } from "../components/ProfileForm";
import { Disclaimer, TopBar } from "../components/ui";
import { loadDemo } from "../lib/demo";
import { go } from "../lib/router";
import { checkPin, deleteEverything, exportJson, saveProfile, setPin, useData } from "../lib/store";

export function Settings() {
  const data = useData();
  const [pin, setPinText] = useState("");
  const [msg, setMsg] = useState("");
  const profile = data.profile ?? { name: "", pronouns: "", createdAt: new Date().toISOString() };

  return (
    <div className="stack-lg">
      <TopBar title="Privacy & profile" />

      <section className="card accent">
        <h2>🔒 Where your data lives</h2>
        <ul className="dots small">
          <li><strong>Only in this browser on this device.</strong> There's no account, and nothing is sent to a server.</li>
          <li>No ads, analytics or trackers.</li>
          <li>Voice is turned into text by your browser's built-in speech feature. Trace never stores or sends audio.</li>
          <li>Clearing your browser data will also delete your Trace data, so export a copy if you want to keep it.</li>
        </ul>
      </section>

      <section className="card">
        <h2>PIN lock</h2>
        <p className="small muted">Stops someone who picks up your phone from opening Trace. It's a simple lock, not encryption.</p>
        {data.pin ? (
          <button className="btn" onClick={() => setPin(null).then(() => setMsg("PIN removed."))}>Remove PIN</button>
        ) : (
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={8} aria-label="New PIN" placeholder="4–8 digits" value={pin} onChange={(e) => setPinText(e.target.value.replace(/\D/g, ""))} />
            <button className="btn primary" disabled={pin.length < 4} onClick={() => setPin(pin).then(() => { setPinText(""); setMsg("PIN set. Trace will ask for it next time you open it."); })}>
              Set
            </button>
          </div>
        )}
        {msg && <p className="small" role="status">{msg}</p>}
      </section>

      <section className="card">
        <h2>Your data</h2>
        <button className="btn block" onClick={() => go("/doctor")}>📄 Doctor summary as PDF (print)</button>
        <button className="btn block" onClick={exportJson}>⬇️ Export everything (JSON)</button>
        <button
          className="btn danger block"
          onClick={() => {
            if (confirm("Delete everything Trace has stored on this device? This can't be undone.")) {
              deleteEverything();
              go("/");
            }
          }}
        >
          🗑️ Delete everything
        </button>
      </section>

      <section className="stack">
        <h2>Profile</h2>
        <ProfileForm value={profile} onChange={saveProfile} />
        <label className="check">
          <input
            type="checkbox"
            checked={profile.hasUterus === "yes"}
            onChange={(e) => saveProfile({ ...profile, hasUterus: e.target.checked ? "yes" : "no" })}
          />
          <span>
            I have a uterus <span className="small muted">(optional; only used to point you to pharmacy treatment for urine infections)</span>
          </span>
        </label>
      </section>

      <section className="card">
        <h2>For reviewers</h2>
        <p className="small muted">Replace your data with Ana's toothache story from the research to see a filled-in app.</p>
        <button className="btn" onClick={() => confirm("Replace current data with example data?") && (loadDemo(), go("/"))}>
          Load example data
        </button>
      </section>

      <Disclaimer />
    </div>
  );
}

export function Lock({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPinText] = useState("");
  const [err, setErr] = useState(false);
  return (
    <form
      className="lock"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await checkPin(pin)) onUnlock();
        else {
          setErr(true);
          setPinText("");
        }
      }}
    >
      <h1 className="center">🔒 Trace is locked</h1>
      <input className="pin-input" type="password" inputMode="numeric" autoFocus aria-label="PIN" value={pin} onChange={(e) => setPinText(e.target.value.replace(/\D/g, ""))} />
      {err && <p role="alert" className="center small">That PIN didn't match.</p>}
      <button className="btn primary block" disabled={pin.length < 4}>Unlock</button>
      <p className="tiny muted center">Forgot it? Clear this site's data in your browser settings. That also deletes your Trace data.</p>
      <a className="btn ghost" href="tel:112">Emergency: call 112</a>
    </form>
  );
}
