import { useState } from "react";
import { track } from "../lib/analytics";

const OPTIONS = [
  { value: "yes", label: "👍 Yes" },
  { value: "somewhat", label: "🤔 Somewhat" },
  { value: "no", label: "👎 No" },
] as const;

const keyFor = (id: string) => `trace.feedback.${id}`;

function read(id: string): string | null {
  try {
    return localStorage.getItem(keyFor(id));
  } catch {
    return null;
  }
}

/**
 * One-question "Did this help?" prompt (measurement for step 7).
 * Sends only the answer (yes/somewhat/no), never any health data.
 * Remembered per entry on this device so it is asked once.
 */
export function Feedback({ entryId }: { entryId: string }) {
  const [answer, setAnswer] = useState<string | null>(() => read(entryId));

  function choose(value: string) {
    setAnswer(value);
    try {
      localStorage.setItem(keyFor(entryId), value);
    } catch {
      /* ignore */
    }
    track("feedback_result", { helped: value });
  }

  return (
    <section className="card no-print" aria-live="polite">
      {answer ? (
        <p>Thanks, that helps me improve Trace. 💚</p>
      ) : (
        <>
          <h3>Did this help you decide where to go?</h3>
          <div className="chips" role="group" aria-label="Did this help you decide where to go?">
            {OPTIONS.map((o) => (
              <button key={o.value} className="chip" onClick={() => choose(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
