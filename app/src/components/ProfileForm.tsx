import type { Profile } from "../lib/types";

const AGE: { v: NonNullable<Profile["ageBand"]>; l: string }[] = [
  { v: "under8", l: "Under 8" },
  { v: "8to16", l: "8–16" },
  { v: "17to35", l: "17–35" },
  { v: "36to69", l: "36–69" },
  { v: "70plus", l: "70+" },
];

const PRONOUNS = ["she/her", "he/him", "they/them"];

export function ProfileForm({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => onChange({ ...value, [k]: v });
  const toggle = (k: "medicalCard" | "gpVisitCard" | "prsiWorker") => set(k, !value[k]);
  return (
    <div className="stack-lg">
      <label className="field">
        What should we call you?
        <input type="text" value={value.name} onChange={(e) => set("name", e.target.value)} placeholder="First name or nickname" autoComplete="given-name" />
      </label>

      <div className="stack">
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Pronouns (optional)</span>
        <div className="chips">
          {PRONOUNS.map((p) => (
            <button key={p} type="button" className="chip" aria-pressed={value.pronouns === p} onClick={() => set("pronouns", value.pronouns === p ? "" : p)}>
              {p}
            </button>
          ))}
        </div>
        <input
          type="text"
          aria-label="Other pronouns"
          placeholder="Or type your own"
          value={PRONOUNS.includes(value.pronouns) ? "" : value.pronouns}
          onChange={(e) => set("pronouns", e.target.value)}
        />
      </div>

      <div className="stack">
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Age (helps us show what's free for you)</span>
        <div className="chips">
          {AGE.map((a) => (
            <button key={a.v} type="button" className="chip" aria-pressed={value.ageBand === a.v} onClick={() => set("ageBand", value.ageBand === a.v ? undefined : a.v)}>
              {a.l}
            </button>
          ))}
        </div>
      </div>

      <div className="stack">
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Do any of these apply? (optional)</span>
        <div className="checks">
          <label className="check">
            <input type="checkbox" checked={!!value.medicalCard} onChange={() => toggle("medicalCard")} />
            <span>I have a <strong>medical card</strong></span>
          </label>
          <label className="check">
            <input type="checkbox" checked={!!value.gpVisitCard} onChange={() => toggle("gpVisitCard")} />
            <span>I have a <strong>GP visit card</strong></span>
          </label>
          <label className="check">
            <input type="checkbox" checked={!!value.prsiWorker} onChange={() => toggle("prsiWorker")} />
            <span>I work, or have worked, and paid <strong>PRSI</strong> <span className="muted small">(you may get free dental check-ups)</span></span>
          </label>
        </div>
        <p className="tiny muted">Not sure? Leave it blank. HSE Live (1800 700 700) can check your entitlements.</p>
      </div>
    </div>
  );
}
