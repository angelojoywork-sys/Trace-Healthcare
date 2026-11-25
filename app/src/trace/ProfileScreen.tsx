import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { bodyForGender, type Gender, type Profile } from "@/lib/profile";

const OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "none", label: "Prefer not to say" },
];

const label = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";

export function ProfileScreen({ onDone }: { onDone: (p: Profile) => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const finish = (g: Gender | null, n: string) => onDone({ name: n.trim(), gender: g, body: bodyForGender(g) });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 px-5 pt-10 pb-5">
      <h1 className="text-3xl leading-tight font-light">Tell us about you</h1>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className={label}>Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aoife" autoComplete="given-name" className="h-12 rounded-sm" />
      </div>

      <div className="flex flex-col gap-2">
        <p id="gender-label" className={label}>Gender</p>
        <ToggleGroup
          variant="outline"
          aria-labelledby="gender-label"
          className="w-full flex-wrap"
          value={gender ? [gender] : []}
          onValueChange={(v) => setGender((v[0] as Gender | undefined) ?? null)}
        >
          {OPTIONS.map((o) => (
            <ToggleGroupItem
              key={o.value}
              value={o.value}
              className="h-11 rounded-sm font-mono text-xs tracking-widest uppercase data-pressed:border-highlight data-pressed:bg-highlight/10 data-pressed:text-highlight"
            >
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">Sets the body shown when you log. You can change it any time.</p>
      </div>

      <div className="flex-1" />
      <Button size="lg" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={() => finish(gender, name)}>Continue</Button>
      <Button variant="ghost" className="font-mono underline underline-offset-4" onClick={() => finish(null, "")}>Skip</Button>
    </div>
  );
}
