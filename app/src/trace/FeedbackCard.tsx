import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { saveFeedback } from "@/lib/feedback";
import { cn } from "@/lib/utils";

const cap = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";

function Scale({ label, low, high, onPick }: { label: string; low: string; high: string; onPick: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p id="fb-q" className="text-lg leading-snug font-light">{label}</p>
      <div role="group" aria-labelledby="fb-q" className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Button key={n} type="button" variant="outline" aria-label={`${n} of 5. ${n === 1 ? low : n === 5 ? high : ""}`.trim()} onClick={() => onPick(n)} className="h-12 rounded-sm font-mono text-base">{n}</Button>
        ))}
      </div>
      <div className={cn("flex justify-between", cap)}><span>{low}</span><span>{high}</span></div>
    </div>
  );
}

type Props = { onClose: () => void };

export function FeedbackCard({ onClose }: Props) {
  const [step, setStep] = useState<"ease" | "use" | "comment" | "thanks">("ease");
  const [comment, setComment] = useState("");

  const dismiss = () => { saveFeedback("dismissed"); track("feedback_dismissed", { at: step }); onClose(); };
  const finish = (send: boolean) => {
    const text = comment.trim().slice(0, 500);
    if (send && text) track("feedback_comment", { comment: text });
    saveFeedback("done");
    setStep("thanks");
  };

  return (
    <section aria-label="Quick feedback" className="bracket flex flex-col gap-4 px-5 py-5">
      <p className={cap}>Test version · 2 quick questions</p>

      {step === "ease" && <Scale label="How easy was it to log that?" low="Very hard" high="Very easy" onPick={(n) => { track("feedback_ease", { score: n }); setStep("use"); }} />}
      {step === "use" && <Scale label="Would you use this after a GP visit?" low="Never" high="Definitely" onPick={(n) => { track("feedback_use", { score: n }); setStep("comment"); }} />}

      {step === "comment" && (
        <div className="flex flex-col gap-3">
          <label htmlFor="fb-comment" className="text-lg leading-snug font-light">Anything confusing or missing? (optional)</label>
          <Textarea id="fb-comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Tell us what got in the way" className="min-h-24 rounded-sm" />
          <p className="text-xs text-muted-foreground">Please don't include health details or names. This comment is sent to the person testing the app.</p>
          <Button size="lg" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={() => finish(true)}>{comment.trim() ? "Send" : "Done"}</Button>
        </div>
      )}

      {step === "thanks" && (
        <div className="flex flex-col gap-3">
          <p className="text-lg font-light">Thank you. That really helps.</p>
          <Button variant="ghost" className="self-start font-mono underline underline-offset-4" onClick={onClose}>Close</Button>
        </div>
      )}

      {step !== "thanks" && step !== "comment" && (
        <Button variant="ghost" onClick={dismiss} className="self-start font-mono text-xs underline underline-offset-4">Not now</Button>
      )}
    </section>
  );
}
