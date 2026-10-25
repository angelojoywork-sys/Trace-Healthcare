import { useMemo, useState } from "react";
import { BodyMap } from "../components/BodyMap";
import { RedFlagScreen, TopBar, VoiceText } from "../components/ui";
import { MODIFIERS, ONSETS, optionsFor, regionById, scanForRedFlag, UNIVERSAL_RED_FLAGS, type SymptomOption } from "../lib/regions";
import { route } from "../lib/routing";
import { go } from "../lib/router";
import { addEntry, getData, saveProfile, uid, useData } from "../lib/store";
import type { Episode, IntakeAnswers } from "../lib/types";

type StepId = "where" | "words" | "onset" | "severity" | "associated" | "modifiers" | "anatomy";

const ANATOMY_GROUPS = new Set(["pelvic", "urinary", "abdomen"]);

export function Intake() {
  const profile = useData().profile;
  // Decided once, so answering the question doesn't remove the step you're on.
  const [needsAnatomy] = useState(() => !profile?.hasUterus || profile.hasUterus === "skip");
  const [a, setA] = useState<IntakeAnswers>({ regionId: "", ownWords: "", onset: "", severity: -1, modifiers: [], associated: [] });
  const [i, setI] = useState(0);
  const [redFlag, setRedFlag] = useState<string | null>(null);

  const group = regionById(a.regionId)?.group;
  const steps = useMemo<StepId[]>(() => {
    const s: StepId[] = ["where", "words", "onset", "severity", "associated", "modifiers"];
    // Anatomy-first, only when relevant, never gating (design principle 8).
    if (group && ANATOMY_GROUPS.has(group) && needsAnatomy) s.push("anatomy");
    return s;
  }, [group, needsAnatomy]);
  const step = steps[i];
  const region = regionById(a.regionId);

  function save(flag?: string): Episode {
    const r = route(a, getData().profile);
    const ep: Episode = {
      id: uid(),
      kind: "episode",
      createdAt: new Date().toISOString(),
      title: region?.label ?? "Symptom",
      answers: a,
      door: flag ? "emergency" : r.door.id,
      redFlag: flag,
    };
    addEntry(ep);
    return ep;
  }

  function next() {
    if (step === "words") {
      const hit = scanForRedFlag(a.ownWords);
      if (hit) return setRedFlag(hit);
    }
    if (i < steps.length - 1) setI(i + 1);
    else {
      const ep = save();
      go(`/result?id=${ep.id}`);
    }
  }

  function toggleAssoc(o: SymptomOption) {
    const on = a.associated.includes(o.id);
    const associated = on ? a.associated.filter((x) => x !== o.id) : [...a.associated, o.id];
    setA({ ...a, associated });
    if (!on && o.redFlag) setRedFlag(o.redFlag);
  }

  if (redFlag)
    return (
      <RedFlagScreen
        reason={redFlag}
        onSafe={() => {
          save(redFlag);
          go("/");
        }}
      />
    );

  const canNext =
    (step === "where" && !!a.regionId) ||
    step === "words" ||
    (step === "onset" && !!a.onset) ||
    (step === "severity" && a.severity >= 0) ||
    step === "associated" ||
    step === "modifiers" ||
    step === "anatomy";

  const prompt: Record<StepId, string> = {
    where: "Where is it? Tap the spot.",
    words: `Tell me about your ${region?.label.toLowerCase() ?? "symptom"} in your own words. What does it feel like?`,
    onset: "When did it start?",
    severity: "How bad is it right now, from 0 to 10?",
    associated: "Do you have any of these?",
    modifiers: "Does anything make it better or worse?",
    anatomy: "One quick question about your body, so I can point you to the right place.",
  };

  return (
    <div className="stack-lg">
      <TopBar title="Something's wrong" back={() => (i === 0 ? go("/") : setI(i - 1))} />
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1} aria-label={`Question ${i + 1} of ${steps.length}`}>
        <i style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="bubble trace" aria-live="polite">
        <p>{prompt[step]}</p>
        {step === "where" && <p className="small muted">For a toothache or jaw pain, choose "Face & teeth".</p>}
        {step === "words" && <p className="small muted">You can skip this if you'd rather just tap answers.</p>}
      </div>

      {step === "where" && <BodyMap value={a.regionId || null} onChange={(regionId) => setA({ ...a, regionId, associated: [] })} />}
      {step === "where" && region && <div className="bubble me">{region.label}</div>}

      {step === "words" && (
        <VoiceText
          label="Describe it in your own words"
          value={a.ownWords}
          onChange={(ownWords) => setA({ ...a, ownWords })}
          placeholder="e.g. Dull ache in my back tooth for a few days, worse at night, goes up to my ear"
          autoFocus
        />
      )}

      {step === "onset" && (
        <div className="chips" role="group" aria-label="When it started">
          {ONSETS.map((o) => (
            <button key={o} className="chip" aria-pressed={a.onset === o} onClick={() => setA({ ...a, onset: o })}>
              {o}
            </button>
          ))}
        </div>
      )}

      {step === "severity" && (
        <div className="stack">
          <div className="scale" role="group" aria-label="Pain or discomfort score">
            {Array.from({ length: 11 }, (_, n) => (
              <button key={n} aria-pressed={a.severity === n} onClick={() => setA({ ...a, severity: n })}>
                {n}
              </button>
            ))}
          </div>
          <div className="spread small muted">
            <span>0 · none</span>
            <span>5 · hard to ignore</span>
            <span>10 · worst</span>
          </div>
        </div>
      )}

      {step === "associated" && (
        <div className="stack">
          <div className="checks">
            {optionsFor(a.regionId).map((o) => (
              <label key={o.id} className={`check${o.redFlag ? " rf" : ""}`}>
                <input type="checkbox" checked={a.associated.includes(o.id)} onChange={() => toggleAssoc(o)} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          <h3 style={{ marginTop: "0.5rem" }}>Any of these, right now?</h3>
          <div className="checks">
            {UNIVERSAL_RED_FLAGS.map((o) => (
              <label key={o.id} className="check rf">
                <input type="checkbox" checked={a.associated.includes(o.id)} onChange={() => toggleAssoc(o)} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          <p className="small muted">Ticking a red-outlined item takes you straight to emergency help.</p>
        </div>
      )}

      {step === "modifiers" && (
        <div className="chips" role="group" aria-label="What makes it better or worse">
          {(group === "dental" ? MODIFIERS.dental : MODIFIERS.default).map((m) => {
            const on = a.modifiers.includes(m);
            return (
              <button key={m} className="chip" aria-pressed={on} onClick={() => setA({ ...a, modifiers: on ? a.modifiers.filter((x) => x !== m) : [...a.modifiers, m] })}>
                {m}
              </button>
            );
          })}
        </div>
      )}

      {step === "anatomy" && (
        <div className="stack">
          <p>Do you have a uterus (womb)?</p>
          <p className="small muted">Some services, such as pharmacist treatment for urine infections, depend on anatomy. We don't ask about gender. Your answer stays on this phone.</p>
          <div className="chips">
            {(
              [
                ["yes", "Yes"],
                ["no", "No"],
                ["skip", "Prefer not to say"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                className="chip"
                aria-pressed={profile?.hasUterus === v}
                onClick={() => {
                  const p = profile ?? { name: "", pronouns: "", createdAt: new Date().toISOString() };
                  saveProfile({ ...p, hasUterus: v });
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="btn primary block" disabled={!canNext} onClick={next}>
        {i === steps.length - 1 ? "Show me where to go" : step === "words" && !a.ownWords ? "Skip" : "Next"}
      </button>
    </div>
  );
}
