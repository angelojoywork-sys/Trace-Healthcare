import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";

type Rec = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
  start(): void; stop(): void;
};
const SR = (() => {
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
})();

const label = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";

type Props = { area: string; onSubmit: (note: string) => void; onSkip: () => void };

export function NoteSheet({ area, onSubmit, onSkip }: Props) {
  const [note, setNote] = useState("");
  const [listening, setListening] = useState(false);
  const rec = useRef<Rec | null>(null);
  const today = new Date().toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" });

  useEffect(() => () => rec.current?.stop(), []);

  const toggleVoice = () => {
    if (!SR) return;
    if (listening) { rec.current?.stop(); return; }
    const base = note.trim();
    const r = new SR();
    r.lang = "en-IE";
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e) => {
      const text = Array.from(e.results).map((x) => x[0].transcript).join(" ");
      setNote((base ? base + " " : "") + text.trim());
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    r.start();
    setListening(true);
    track("voice_used");
  };

  return (
    <section
      aria-label="Add a note"
      onClick={(e) => e.stopPropagation()}
      className="glass absolute inset-x-3 bottom-3 flex flex-col gap-4 p-5"
    >
      <div className="flex gap-8">
        <div><p className={label}>Area</p><p className="text-lg font-light">{area}</p></div>
        <div><p className={label}>When</p><p className="text-lg font-light">Today, {today}</p></div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="note" className={label}>Note (optional)</label>
        <div className="flex items-start gap-2">
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What does it feel like?" className="min-h-[88px] rounded-sm" />
          {SR && (
            <Button
              type="button" variant="outline" size="icon"
              aria-label={listening ? "Stop listening" : "Speak your note"} aria-pressed={listening}
              onClick={toggleVoice}
              className={"size-12 shrink-0 rounded-sm " + (listening ? "border-highlight bg-highlight/10 text-highlight" : "")}
            >
              <Mic className="size-5" />
            </Button>
          )}
        </div>
        {listening && <p className="font-mono text-[11px] tracking-widest text-highlight uppercase" aria-live="polite">Listening</p>}
      </div>
      {note.trim() && (
        <Button size="lg" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={() => { rec.current?.stop(); track("note_added", { length: note.trim().length }); onSubmit(note.trim()); }}>
          Next
        </Button>
      )}
      <Button variant="ghost" className="font-mono underline underline-offset-4" onClick={() => { rec.current?.stop(); onSkip(); }}>
        Not now
      </Button>
    </section>
  );
}
