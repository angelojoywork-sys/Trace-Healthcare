import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { loadEntries, saveEntry, SEVERITY, type Entry } from "@/lib/entries";
import { loadProfile, saveProfile, type Profile } from "@/lib/profile";
import type { BodyView } from "./HologramCanvas";
import { ProfileScreen } from "./ProfileScreen";
import { WelcomeScreen } from "./WelcomeScreen";
import { BodyScreen } from "./BodyScreen";
import { SeverityScreen } from "./SeverityScreen";

type Draft = { area: string; note: string; via: "3d" | "list" };
type Step = { name: "welcome" } | { name: "profile" } | { name: "body" } | { name: "severity"; draft: Draft } | { name: "done"; entry: Entry };

export function TraceApp() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [step, setStep] = useState<Step>(() => (loadProfile() ? { name: "body" } : { name: "welcome" }));
  useEffect(() => { track("app_open"); }, []);
  const changeBody = (body: BodyView) => {
    const next: Profile = { name: profile?.name ?? "", gender: profile?.gender ?? null, body };
    setProfile(next);
    saveProfile(next);
    track("body_changed", { view: body });
  };

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-foreground">
      {step.name === "welcome" && <WelcomeScreen onLog={() => { track("welcome_log_symptom"); setStep({ name: "profile" }); }} />}
      {step.name === "profile" && (
        <ProfileScreen
          onDone={(p) => {
            setProfile(p);
            saveProfile(p);
            track("profile_saved", { has_name: !!p.name, has_gender: !!p.gender });
            setStep({ name: "body" });
          }}
        />
      )}
      {step.name === "body" && <BodyScreen view={profile?.body ?? "neutral"} onViewChange={changeBody} onDone={(draft) => setStep({ name: "severity", draft })} />}
      {step.name === "severity" && (
        <SeverityScreen
          onBack={() => setStep({ name: "body" })}
          onClose={() => setStep({ name: "body" })}
          onNext={(severity) => {
            const d = step.draft;
            const entry: Entry = { id: crypto.randomUUID(), area: d.area, note: d.note, severity, createdAt: new Date().toISOString() };
            saveEntry(entry);
            track("severity_set", { value: severity });
            track("log_saved", { has_note: !!d.note, via: d.via });
            setStep({ name: "done", entry });
          }}
        />
      )}
      {step.name === "done" && (
        <div className="flex min-h-0 flex-1 flex-col gap-6 px-5 pt-10 pb-5">
          <p className="font-mono text-xs tracking-widest text-highlight uppercase">Saved · {loadEntries().length} on this phone</p>
          <h1 className="text-4xl leading-tight font-light">Noted.<br />Take care.</h1>
          <dl className="flex flex-col gap-4 border-l border-line pl-4">
            <div><dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Area</dt><dd className="text-lg font-light">{step.entry.area}</dd></div>
            <div><dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Severity</dt><dd className="text-lg font-light">{SEVERITY[step.entry.severity]}</dd></div>
            {step.entry.note && <div><dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Note</dt><dd className="text-lg font-light">{step.entry.note}</dd></div>}
          </dl>
          <div className="flex-1" />
          <Button size="lg" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={() => setStep({ name: "body" })}>Log another</Button>
        </div>
      )}
    </div>
  );
}
