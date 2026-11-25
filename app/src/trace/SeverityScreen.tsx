import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SeverityField } from "./SquareField";

type Props = { onBack: () => void; onClose: () => void; onNext: (severity: number) => void };

export function SeverityScreen({ onBack, onClose, onNext }: Props) {
  const [v, setV] = useState(5);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 px-5 pt-4 pb-5">
      <header className="grid grid-cols-[44px_1fr_44px] items-center">
        <Button variant="outline" size="icon" aria-label="Back" className="size-11 rounded-sm" onClick={onBack}><ChevronLeft className="size-5" /></Button>
        <h1 className="text-center font-mono text-sm tracking-widest uppercase">Severity</h1>
        <Button variant="outline" size="icon" aria-label="Close" className="size-11 rounded-sm" onClick={onClose}><X className="size-5" /></Button>
      </header>

      <h2 className="text-center text-3xl leading-tight font-light">How bad is it<br />right now?</h2>

      <div className="relative min-h-0 flex-1">
        <SeverityField level={v} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-center font-mono text-5xl leading-none" aria-live="polite" aria-label={`${v} out of 10`}>
          {v}<span className="ml-2 text-xl text-muted-foreground">/ 10</span>
        </p>
        <Slider min={1} max={10} step={1} value={v} onValueChange={(x) => setV(x as number)} aria-label="Severity from 1 to 10" />
        <div className="flex justify-between font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          <span>1</span><span>10</span>
        </div>
      </div>

      <Button size="lg" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={() => onNext(v)}>Next</Button>
    </div>
  );
}
