import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SEVERITY } from "@/lib/entries";

type Props = { onBack: () => void; onClose: () => void; onNext: (severity: number) => void };

export function SeverityScreen({ onBack, onClose, onNext }: Props) {
  const [v, setV] = useState(2);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 px-5 pt-4 pb-5">
      <header className="grid grid-cols-[44px_1fr_44px] items-center">
        <Button variant="outline" size="icon" aria-label="Back" className="size-11 rounded-sm" onClick={onBack}><ChevronLeft className="size-5" /></Button>
        <h1 className="text-center font-mono text-sm tracking-widest uppercase">Severity</h1>
        <Button variant="outline" size="icon" aria-label="Close" className="size-11 rounded-sm" onClick={onClose}><X className="size-5" /></Button>
      </header>

      <h2 className="text-center text-3xl leading-tight font-light">How bad is it<br />right now?</h2>

      <div className="flex flex-1 items-center justify-center">
        <div
          aria-hidden="true"
          className="size-36 transition-all duration-300 motion-reduce:transition-none"
          style={{
            borderRadius: "44% 56% 52% 48% / 48% 44% 56% 52%",
            background: "radial-gradient(circle at 40% 35%, #2b5f5a, #12302e 70%)",
            transform: `scale(${0.8 + v * 0.1})`,
            boxShadow: `0 0 ${20 + v * 14}px rgba(100,255,218,${0.25 + v * 0.12})`,
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-center font-mono text-base tracking-widest uppercase" aria-live="polite">{SEVERITY[v]}</p>
        <Slider min={0} max={4} step={1} value={v} onValueChange={(x) => setV(x as number)} aria-label="Severity" />
        <div className="flex justify-between font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          <span>Very mild</span><span>Very severe</span>
        </div>
      </div>

      <Button size="lg" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={() => onNext(v)}>Next</Button>
    </div>
  );
}
