import { useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, FileText, Share2, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { knownGps, updateEntry, type Entry } from "@/lib/entries";
import { addFile, listFiles, removeFile, type FileRec } from "@/lib/files";
import { cn } from "@/lib/utils";
import { relativeDay, severityTone } from "./dates";

const cap = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";
const tone = { mild: "bg-severity-mild", moderate: "bg-severity-moderate", severe: "bg-severity-severe" } as const;

function Thumb({ rec, onRemove }: { rec: FileRec; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!rec.type.startsWith("image/")) return;
    const u = URL.createObjectURL(rec.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [rec]);
  return (
    <li className="relative size-24 border border-line">
      {url ? <img src={url} alt={`Attached: ${rec.name}`} className="size-full object-cover" /> : (
        <div className="grid size-full place-items-center p-2 text-center text-muted-foreground"><FileText className="size-6" /><span className="line-clamp-2 text-[10px] break-all">{rec.name}</span></div>
      )}
      <Button type="button" variant="outline" size="icon" aria-label={`Remove ${rec.name}`} onClick={onRemove} className="absolute -top-3 -right-3 size-11 rounded-sm bg-background">
        <X className="size-4" />
      </Button>
    </li>
  );
}

type Props = { entry: Entry; onBack: () => void; onShare: () => void; onDelete: () => void };

export function EntryScreen({ entry, onBack, onShare, onDelete }: Props) {
  const [gp, setGp] = useState(entry.gp ?? "");
  const [visitDate, setVisitDate] = useState(entry.visitDate ?? "");
  const [said, setSaid] = useState(entry.gpSaid ?? "");
  const [files, setFiles] = useState<FileRec[]>([]);
  const [fileError, setFileError] = useState(false);
  const suggestions = useRef(knownGps().filter((g) => g !== entry.gp)).current;
  const photoInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => { track("entry_opened"); listFiles(entry.id).then(setFiles); }, [entry.id]);

  // Text fields save as you type, so there is nothing to forget to press.
  const save = (patch: Partial<Entry>) => updateEntry(entry.id, patch);

  const attach = async (list: FileList | null, kind: "photo" | "upload") => {
    if (!list?.length) return;
    setFileError(false);
    try {
      const added = await Promise.all([...list].map((f) => addFile(entry.id, f)));
      setFiles((cur) => [...cur, ...added]);
      track("file_added", { kind, count: added.length });
    } catch {
      setFileError(true);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-line px-5 pt-4 pb-3">
        <Button variant="outline" size="icon" aria-label="Back" className="size-11 rounded-sm" onClick={onBack}><ChevronLeft className="size-5" /></Button>
        <div>
          <h1 className="text-xl leading-tight font-light">{entry.area}</h1>
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <span aria-hidden="true" className={cn("size-2", tone[severityTone(entry.severity)])} />
            {entry.severity}/10 <span className="text-muted-foreground">· {relativeDay(entry.createdAt)}</span>
          </p>
        </div>
        <Button variant="outline" size="icon" aria-label="Share visit" className="ml-auto size-11 rounded-sm" onClick={onShare}><Share2 className="size-5" /></Button>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-8">
        {entry.note && (
          <section className="flex flex-col gap-1">
            <p className={cap}>Your note</p>
            <p className="text-lg font-light">{entry.note}</p>
          </section>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="visit-date" className={cap}>Visit date (optional)</Label>
          <Input id="visit-date" type="date" value={visitDate} onChange={(e) => { setVisitDate(e.target.value); save({ visitDate: e.target.value || undefined }); }} className="h-12 rounded-sm" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gp" className={cap}>GP (optional)</Label>
          <Input id="gp" list="gp-names" value={gp} onChange={(e) => { setGp(e.target.value); save({ gp: e.target.value || undefined }); }} onBlur={() => gp.trim() && track("gp_added")} placeholder="Dr. Byrne" autoComplete="off" className="h-12 rounded-sm" />
          <datalist id="gp-names">{suggestions.map((g) => <option key={g} value={g} />)}</datalist>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="said" className={cap}>What the GP said (optional)</Label>
          <Textarea id="said" value={said} onChange={(e) => { setSaid(e.target.value); save({ gpSaid: e.target.value || undefined }); }} onBlur={() => said.trim() && track("gp_said_added")} placeholder="Diagnosis, advice, what to do next" className="min-h-28 rounded-sm" />
        </div>

        <section className="flex flex-col gap-3" aria-label="Prescription or receipt">
          <p className={cap}>Prescription or receipt</p>
          {files.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {files.map((f) => (
                <Thumb key={f.id} rec={f} onRemove={() => { removeFile(f.id).then(() => setFiles((cur) => cur.filter((x) => x.id !== f.id))); track("file_removed"); }} />
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" className="h-12 rounded-sm font-mono text-xs tracking-widest uppercase" onClick={() => photoInput.current?.click()}><Camera className="size-4" />Take photo</Button>
            <Button type="button" variant="outline" className="h-12 rounded-sm font-mono text-xs tracking-widest uppercase" onClick={() => fileInput.current?.click()}><Upload className="size-4" />Upload file</Button>
          </div>
          <input ref={photoInput} type="file" accept="image/*" capture="environment" hidden aria-label="Take a photo" onChange={(e) => { attach(e.target.files, "photo"); e.target.value = ""; }} />
          <input ref={fileInput} type="file" accept="image/*,application/pdf" multiple hidden aria-label="Choose files" onChange={(e) => { attach(e.target.files, "upload"); e.target.value = ""; }} />
          {fileError && <p role="alert" className="text-sm text-destructive">Couldn't save that file on this phone. Check that you have storage space and try again.</p>}
          <p className="text-xs text-muted-foreground">Everything here is saved on this phone as you type.</p>
        </section>

        <section aria-label="Delete" className="flex flex-col gap-2 border-t border-line pt-6">
          <Button type="button" variant="outline" onClick={onDelete} className="h-12 rounded-sm border-destructive font-mono text-xs tracking-widest text-destructive uppercase hover:text-destructive">
            <Trash2 className="size-4" />Delete this log
          </Button>
          <p className="text-xs text-muted-foreground">You can undo for a few seconds. After that, the log and its photos are gone from this phone.</p>
        </section>
      </div>
    </div>
  );
}
