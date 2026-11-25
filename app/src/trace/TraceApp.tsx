import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { deleteEntry, loadEntries, restoreEntry, saveEntry, type Entry } from "@/lib/entries";
import { purgeOrphans, removeFilesFor } from "@/lib/files";
import { Button } from "@/components/ui/button";
import { loadProfile, saveProfile, type Profile } from "@/lib/profile";
import { BodyScreen } from "./BodyScreen";
import { BottomNav, type Tab } from "./BottomNav";
import { BrowseScreen } from "./BrowseScreen";
import type { BodyView } from "./HologramCanvas";
import { EntryScreen } from "./EntryScreen";
import { ProfileScreen } from "./ProfileScreen";
import { SharePack } from "./SharePack";
import { SeverityScreen } from "./SeverityScreen";
import { GpScreen } from "./GpScreen";
import { SummaryScreen } from "./SummaryScreen";
import { WelcomeScreen } from "./WelcomeScreen";

type Draft = { area: string; note: string; via: "3d" | "list" };
type Step = { name: "welcome" } | { name: "profile" } | { name: "body" } | { name: "severity"; draft: Draft } | { name: "home" } | { name: "entry"; id: string } | { name: "share"; id: string };

export function TraceApp() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [step, setStep] = useState<Step>(() => (loadProfile() ? { name: "home" } : { name: "welcome" }));
  const [tab, setTab] = useState<Tab>("summary");
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");
  const [undo, setUndo] = useState<Entry | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);
  useEffect(() => { track("app_open"); purgeOrphans(loadEntries().map((e) => e.id)); }, []);

  // Delete is undoable for 10 seconds. The entry leaves the list at once; its photos are only removed when the time is up.
  const finishDelete = (e: Entry) => { window.clearTimeout(undoTimer.current); removeFilesFor(e.id); };
  const removeEntry = (entry: Entry) => {
    if (undo) finishDelete(undo);
    deleteEntry(entry.id);
    setEntries(loadEntries());
    setUndo(entry);
    track("entry_deleted");
    setStep({ name: "home" });
    undoTimer.current = window.setTimeout(() => { removeFilesFor(entry.id); setUndo(null); }, 10_000);
  };
  const undoDelete = () => {
    if (!undo) return;
    window.clearTimeout(undoTimer.current);
    restoreEntry(undo);
    setEntries(loadEntries());
    setUndo(null);
    track("entry_delete_undone");
  };

  const startLog = (from: string) => { setSaved(false); track("log_started", { from }); setStep({ name: "body" }); };
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
            startLog("onboarding");
          }}
        />
      )}

      {step.name === "body" && (
        <BodyScreen
          view={profile?.body ?? "neutral"}
          onViewChange={changeBody}
          onClose={() => setStep({ name: "home" })}
          onDone={(draft) => setStep({ name: "severity", draft })}
        />
      )}

      {step.name === "severity" && (
        <SeverityScreen
          onBack={() => setStep({ name: "body" })}
          onClose={() => setStep({ name: "home" })}
          onNext={(severity) => {
            const d = step.draft;
            const entry: Entry = { id: crypto.randomUUID(), area: d.area, note: d.note, severity, createdAt: new Date().toISOString() };
            saveEntry(entry);
            setEntries(loadEntries());
            track("severity_set", { value: severity });
            track("log_saved", { has_note: !!d.note, via: d.via });
            setTab("summary");
            setSaved(true);
            setStep({ name: "home" });
          }}
        />
      )}

      {step.name === "entry" && (() => {
        const entry = entries.find((e) => e.id === step.id);
        return entry ? <EntryScreen entry={entry} onBack={() => { setEntries(loadEntries()); setStep({ name: "home" }); }} onShare={() => { setEntries(loadEntries()); setStep({ name: "share", id: entry.id }); }} onDelete={() => removeEntry(entry)} /> : null;
      })()}

      {step.name === "share" && (() => {
        const entry = entries.find((e) => e.id === step.id);
        return entry ? <SharePack entry={entry} name={profile?.name ?? ""} onBack={() => setStep({ name: "entry", id: entry.id })} /> : null;
      })()}

      {step.name === "home" && (
        <>
          {tab === "summary" && <SummaryScreen name={profile?.name ?? ""} entries={entries} saved={saved} onLog={() => startLog("summary")} onOpen={(id) => { setSaved(false); setStep({ name: "entry", id }); }} />}
          {tab === "gp" && <GpScreen />}
          {tab === "browse" && <BrowseScreen entries={entries} query={query} onQuery={setQuery} onOpen={(id) => setStep({ name: "entry", id })} />}
          {undo && (
            <div role="status" className="flex items-center justify-between gap-3 border-t border-highlight bg-background px-5 py-2">
              <span className="font-mono text-xs tracking-widest uppercase">Deleted {undo.area}</span>
              <Button variant="ghost" onClick={undoDelete} className="h-11 rounded-sm font-mono text-xs tracking-widest text-highlight uppercase underline underline-offset-4">Undo</Button>
            </div>
          )}
          <BottomNav tab={tab} onTab={(t) => { setSaved(false); setTab(t); track("tab_changed", { tab: t }); }} />
        </>
      )}
    </div>
  );
}
