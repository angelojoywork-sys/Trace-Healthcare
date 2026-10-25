import { useState } from "react";
import { TopBar, VoiceText } from "../components/ui";
import { downloadIcs, FEELINGS, fmtDate } from "../lib/format";
import { parseRecap } from "../lib/recap";
import { regionById } from "../lib/regions";
import { go } from "../lib/router";
import { addEntry, uid, useData } from "../lib/store";
import type { Episode, Feeling, Medicine, Visit } from "../lib/types";

const CLINICIANS = ["GP", "Dentist", "Pharmacist", "Nurse", "Consultant / hospital", "Physiotherapist", "Other"];

function Lines({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div className="stack">
      <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{label}</span>
      {items.map((t, i) => (
        <div key={i} className="row" style={{ flexWrap: "nowrap" }}>
          <input type="text" value={t} aria-label={`${label} ${i + 1}`} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <button className="btn ghost" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button className="btn ghost small" style={{ alignSelf: "flex-start" }} onClick={() => onChange([...items, ""])}>+ {placeholder}</button>
    </div>
  );
}

export function Recap({ episodeId }: { episodeId?: string }) {
  const data = useData();
  const episodes = data.entries.filter((e): e is Episode => e.kind === "episode" && !e.redFlag).reverse();
  const [stage, setStage] = useState<"capture" | "review" | "done">("capture");
  const [text, setText] = useState("");
  const [v, setV] = useState<Omit<Visit, "id" | "kind" | "createdAt" | "rawText">>({
    episodeId: episodeId ?? episodes.find((e) => !e.resolved)?.id,
    clinician: "",
    said: [],
    medicines: [],
    nextSteps: [],
  });
  const [saved, setSaved] = useState<Visit | null>(null);

  if (stage === "capture")
    return (
      <div className="stack-lg">
        <TopBar title="After your appointment" />
        <div className="bubble trace">
          <p>While it's fresh, tell me what happened. Who did you see, what did they say, any medicines, and what happens next?</p>
          <p className="small muted">Speak like you'd tell a friend. I'll sort it into a summary, and you can fix anything I get wrong.</p>
        </div>
        <VoiceText
          label="What happened at the appointment"
          value={text}
          onChange={setText}
          rows={7}
          autoFocus
          placeholder="e.g. Dentist said possible abscess. Amoxicillin 500 three times a day for 7 days. X-ray next week, come back in 2 weeks if not settled."
        />
        <p className="tiny muted">🔒 Voice is turned into text by your browser. Trace never uploads audio. Record only yourself, not the clinician, unless they agree.</p>
        <button
          className="btn primary block"
          disabled={text.trim().length < 5}
          onClick={() => {
            const p = parseRecap(text);
            setV((prev) => ({ ...prev, ...p, followUpDate: p.followUpDate, followUpNote: p.followUpNote }));
            setStage("review");
          }}
        >
          Make my summary
        </button>
        <button className="btn ghost block" onClick={() => setStage("review")}>Or fill it in by hand</button>
      </div>
    );

  if (stage === "done" && saved)
    return (
      <div className="stack-lg">
        <TopBar title="Saved" />
        <div className="card accent">
          <h2>✓ Your visit is saved</h2>
          <p>You don't need to remember it all now. It's in your timeline and on the Show my doctor screen.</p>
        </div>
        {saved.followUpDate && (
          <div className="card">
            <h3>📅 Follow-up on {fmtDate(saved.followUpDate)}</h3>
            <p className="small muted">Trace will show this on your home screen. Add it to your calendar so your phone reminds you too.</p>
            <button className="btn primary block" onClick={() => downloadIcs(saved.followUpDate!, `Follow-up: ${saved.clinician || "appointment"}`, saved.followUpNote ?? "")}>
              Add to my calendar
            </button>
          </div>
        )}
        <button className="btn block" onClick={() => go("/")}>Back to home</button>
      </div>
    );

  const setMed = (i: number, patch: Partial<Medicine>) => setV({ ...v, medicines: v.medicines.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  const [feeling, note] = [v.feeling, v.feelingNote ?? ""];

  return (
    <div className="stack-lg">
      <TopBar title="Check your summary" back={() => setStage("capture")} />
      <p className="muted">Here's what I picked up. Check it and change anything that's wrong.</p>

      <div className="stack">
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Who did you see?</span>
        <div className="chips">
          {CLINICIANS.map((c) => (
            <button key={c} className="chip" aria-pressed={v.clinician === c} onClick={() => setV({ ...v, clinician: c })}>{c}</button>
          ))}
        </div>
      </div>

      {episodes.length > 0 && (
        <label className="field">
          Which issue is this about?
          <select value={v.episodeId ?? ""} onChange={(e) => setV({ ...v, episodeId: e.target.value || undefined })}>
            <option value="">Not linked</option>
            {episodes.map((e) => (
              <option key={e.id} value={e.id}>
                {regionById(e.answers.regionId)?.label ?? e.title} · {fmtDate(e.createdAt)}
              </option>
            ))}
          </select>
        </label>
      )}

      <Lines label="What they said" items={v.said} onChange={(said) => setV({ ...v, said })} placeholder="Add something they said" />

      <div className="stack">
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Medicines</span>
        {v.medicines.length === 0 && <p className="small muted">No medicines picked up.</p>}
        {v.medicines.map((m, i) => (
          <div key={i} className="card" style={{ gap: "0.5rem" }}>
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <input type="text" aria-label="Medicine name" value={m.name} onChange={(e) => setMed(i, { name: e.target.value })} placeholder="Name" />
              <button className="btn ghost" aria-label="Remove medicine" onClick={() => setV({ ...v, medicines: v.medicines.filter((_, j) => j !== i) })}>✕</button>
            </div>
            <div className="med-fields">
              <input type="text" aria-label="Dose" value={m.dose} onChange={(e) => setMed(i, { dose: e.target.value })} placeholder="Dose" />
              <input type="text" aria-label="How often" value={m.frequency} onChange={(e) => setMed(i, { frequency: e.target.value })} placeholder="How often" />
              <input type="text" aria-label="How long" value={m.duration} onChange={(e) => setMed(i, { duration: e.target.value })} placeholder="How long" />
            </div>
          </div>
        ))}
        <button className="btn ghost small" style={{ alignSelf: "flex-start" }} onClick={() => setV({ ...v, medicines: [...v.medicines, { name: "", dose: "", frequency: "", duration: "" }] })}>
          + Add a medicine
        </button>
      </div>

      <Lines label="Next steps" items={v.nextSteps} onChange={(nextSteps) => setV({ ...v, nextSteps })} placeholder="Add a next step" />

      <div className="card">
        <label className="field">
          Follow-up date
          <input type="date" value={v.followUpDate ?? ""} onChange={(e) => setV({ ...v, followUpDate: e.target.value || undefined })} />
        </label>
        <label className="field">
          Note
          <input type="text" value={v.followUpNote ?? ""} onChange={(e) => setV({ ...v, followUpNote: e.target.value })} placeholder="e.g. Come back if not settled" />
        </label>
      </div>

      <div className="stack">
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>How are you feeling after it?</span>
        <div className="row" style={{ justifyContent: "space-between" }}>
          {FEELINGS.map((f) => (
            <button key={f.value} className="chip" style={{ fontSize: "1.5rem", padding: "0.4rem 0.6rem" }} aria-label={f.label} title={f.label} aria-pressed={feeling === f.value} onClick={() => setV({ ...v, feeling: f.value as Feeling })}>
              {f.emoji}
            </button>
          ))}
        </div>
        <input type="text" aria-label="How you're feeling, in words" value={note} onChange={(e) => setV({ ...v, feelingNote: e.target.value })} placeholder="In a few words (optional)" />
      </div>

      <button
        className="btn primary block"
        onClick={() => {
          const visit: Visit = {
            ...v,
            said: v.said.filter(Boolean),
            nextSteps: v.nextSteps.filter(Boolean),
            medicines: v.medicines.filter((m) => m.name.trim()),
            id: uid(),
            kind: "visit",
            createdAt: new Date().toISOString(),
            rawText: text,
          };
          addEntry(visit);
          setSaved(visit);
          setStage("done");
        }}
      >
        Save this visit
      </button>
    </div>
  );
}
