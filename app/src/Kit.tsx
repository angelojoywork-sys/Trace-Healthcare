import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";

const SEVERITY = ["Very mild", "Mild", "Moderate", "Severe", "Very severe"];

/** Preview of the shadcn components in Trace tokens. Open the app with ?kit */
export function Kit() {
  const [gender, setGender] = useState<string[]>(["female"]);
  const [sev, setSev] = useState(2);
  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 p-6">
      <h1 className="text-3xl font-light">Component kit</h1>

      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Buttons</p>
        <Button size="lg" className="font-mono tracking-widest uppercase">Continue with Google</Button>
        <Button size="lg" variant="outline" className="font-mono tracking-widest uppercase">Log symptom</Button>
        <Button variant="ghost" className="font-mono underline underline-offset-4">Skip</Button>
      </section>

      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Name and gender</p>
        <Label htmlFor="name" className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Name</Label>
        <Input id="name" placeholder="Aoife" className="h-12" />
        <ToggleGroup variant="outline" className="w-full flex-wrap" value={gender} onValueChange={setGender} aria-label="Gender">
          {["female", "male", "other", "none"].map((g) => (
            <ToggleGroupItem
              key={g}
              value={g}
              className="h-11 font-mono text-xs tracking-widest uppercase data-pressed:border-highlight data-pressed:bg-highlight/10 data-pressed:text-highlight"
            >
              {{ female: "Female", male: "Male", other: "Other", none: "Prefer not to say" }[g]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Note pop-up</p>
        <Card className="border border-line bg-card/60">
          <CardContent className="flex flex-col gap-4">
            <p className="font-mono text-xs text-muted-foreground"><span className="text-foreground">X</span> 212 <span className="ml-3 text-foreground">Y</span> 121</p>
            <div>
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Area</p>
              <p className="text-lg font-light">Throat</p>
            </div>
            <Textarea placeholder="What does it feel like?" aria-label="Note" />
            <Button size="lg" className="font-mono tracking-widest uppercase">Almost there</Button>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Severity</p>
        <p className="font-mono text-sm tracking-widest uppercase">{SEVERITY[sev]}</p>
        <Slider min={0} max={4} step={1} value={sev} onValueChange={(v) => setSev(v as number)} aria-label="Severity" />
        <div className="flex gap-4 font-mono text-xs uppercase">
          <span className="text-severity-mild">■ Mild</span>
          <span className="text-severity-moderate">■ Moderate</span>
          <span className="text-severity-severe">■ Severe</span>
        </div>
      </section>
    </main>
  );
}
