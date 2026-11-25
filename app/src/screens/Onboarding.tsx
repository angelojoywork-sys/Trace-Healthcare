import { useState } from "react";
import { ProfileForm } from "../components/ProfileForm";
import { Disclaimer, Logo } from "../components/ui";
import { loadDemo } from "../lib/demo";
import { go } from "../lib/router";
import { saveProfile } from "../lib/store";
import type { Profile } from "../lib/types";

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>({ name: "", pronouns: "", createdAt: new Date().toISOString() });

  if (step === 0)
    return (
      <div className="stack-lg" style={{ paddingTop: "8dvh" }}>
        <Logo />
        <h1 style={{ fontSize: "2.4rem" }}>Describe it. Find the right door. Remember what they said.</h1>
        <p className="muted">
          Trace helps you work out where to go in the Irish health system, and keeps a record of every visit to show your next doctor.
        </p>
        <div className="card accent">
          <h3>🔒 Your data stays on this phone</h3>
          <ul className="dots small">
            <li>Nothing you enter leaves this device. There's no account, no server and no trackers.</li>
            <li>You can lock it with a PIN, export it, or delete everything at any time.</li>
            <li>Trace asks questions and points you to a service. It never tells you what you have.</li>
          </ul>
        </div>
        <button className="btn primary block" onClick={() => setStep(1)}>Get started</button>
        <button
          className="btn ghost block"
          onClick={() => {
            loadDemo();
            go("/");
          }}
        >
          Just looking? Explore with example data (Ana's toothache)
        </button>
        <Disclaimer />
      </div>
    );

  return (
    <div className="stack-lg">
      <div className="topbar">
        <button className="back" aria-label="Back" onClick={() => setStep(0)}>←</button>
        <h1>About you</h1>
      </div>
      <p className="muted">Everything here is optional, and you can change it later.</p>
      <ProfileForm value={p} onChange={setP} />
      <button
        className="btn primary block"
        onClick={() => {
          saveProfile({ ...p, name: p.name.trim() });
          go("/");
        }}
      >
        Continue
      </button>
    </div>
  );
}
