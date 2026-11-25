import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import type { Entry } from "@/lib/entries";
import { listFiles, type FileRec } from "@/lib/files";
import { buildPdf, summaryText, visitDay, type PackOptions } from "@/lib/sharepack";

const cap = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";

function Row({ id, label, detail, checked, onChange, locked }: { id: string; label: string; detail?: string; checked: boolean; onChange: (v: boolean) => void; locked?: boolean }) {
  return (
    <label htmlFor={id} className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-line py-2">
      <input id={id} type="checkbox" checked={checked} disabled={locked} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-[var(--highlight)]" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{label}</span>
        {detail && <span className="truncate text-xs text-muted-foreground">{detail}</span>}
      </span>
    </label>
  );
}

type Props = { entry: Entry; name: string; onBack: () => void };

export function SharePack({ entry, name, onBack }: Props) {
  const [files, setFiles] = useState<FileRec[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [opts, setOpts] = useState<PackOptions>({ name, includeName: !!name, includeNote: true, includeSaid: true });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    track("share_pack_opened");
    listFiles(entry.id).then((f) => { setFiles(f); setPicked(new Set(f.map((x) => x.id))); });
  }, [entry.id]);

  const chosen = useMemo(() => files.filter((f) => picked.has(f.id)), [files, picked]);
  const pdfOnly = chosen.filter((f) => !f.type.startsWith("image/"));
  const canShareFiles = typeof navigator !== "undefined" && "canShare" in navigator;
  const stamp = (entry.visitDate ?? entry.createdAt).slice(0, 10);

  const make = async () => {
    const blob = await buildPdf(entry, opts, chosen);
    return new File([blob], `visit-summary-${stamp}.pdf`, { type: "application/pdf" });
  };

  const run = async (kind: "share" | "download") => {
    setBusy(true); setError(""); setStatus("");
    try {
      const pdf = await make();
      if (kind === "share") {
        const extra = pdfOnly.map((f) => new File([f.blob], f.name, { type: f.type }));
        const data = { files: [pdf, ...extra], title: "Visit summary", text: summaryText(entry, opts, chosen) };
        if (navigator.canShare?.({ files: data.files })) {
          await navigator.share(data);
          track("share_pack_done", { method: "share", files: chosen.length });
          setStatus("Shared.");
          return;
        }
      }
      const url = URL.createObjectURL(pdf);
      const a = document.createElement("a");
      a.href = url; a.download = pdf.name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      track("share_pack_done", { method: "download", files: chosen.length });
      setStatus("PDF saved to your downloads.");
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") setError("Couldn't make the PDF. Try again, or copy the summary instead.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    setError(""); setStatus("");
    try {
      await navigator.clipboard.writeText(summaryText(entry, opts, chosen));
      track("share_pack_done", { method: "copy", files: chosen.length });
      setStatus("Summary copied.");
    } catch {
      setError("Couldn't copy. Select and copy the text from the PDF instead.");
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-line px-5 pt-4 pb-3">
        <Button variant="outline" size="icon" aria-label="Back" className="size-11 rounded-sm" onClick={onBack}><ChevronLeft className="size-5" /></Button>
        <div>
          <h1 className="text-xl leading-tight font-light">Share visit</h1>
          <p className={cap}>{entry.area} · {visitDay(entry)}</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-8">
        <section aria-label="What to include" className="flex flex-col">
          <p className={cap}>Included</p>
          <Row id="inc-details" label="Visit details" detail="Always included: date, GP, symptom area, severity" checked locked onChange={() => {}} />
          {name && <Row id="inc-name" label="Your name" detail={name} checked={opts.includeName} onChange={(v) => setOpts({ ...opts, includeName: v })} />}
          {entry.note && <Row id="inc-note" label="Your symptom note" checked={opts.includeNote} onChange={(v) => setOpts({ ...opts, includeNote: v })} />}
          {entry.gpSaid && <Row id="inc-said" label="What the GP said" checked={opts.includeSaid} onChange={(v) => setOpts({ ...opts, includeSaid: v })} />}
          {files.map((f) => (
            <Row key={f.id} id={`f-${f.id}`} label={f.name} detail={f.type.startsWith("image/") ? "Photo, added to the PDF" : "Sent as a separate file"} checked={picked.has(f.id)}
              onChange={(v) => setPicked((cur) => { const n = new Set(cur); if (v) n.add(f.id); else n.delete(f.id); return n; })} />
          ))}
          {files.length === 0 && (
            <p className="flex items-center gap-2 py-3 text-sm text-muted-foreground"><FileText className="size-4" />No prescription or receipt attached yet. Add one on the visit page if your insurer asks for it.</p>
          )}
        </section>

        <p className="text-sm text-muted-foreground">Nothing is sent until you choose where. The PDF is made on this phone.</p>

        <div className="flex flex-col gap-3">
          {canShareFiles && (
            <Button size="lg" disabled={busy} onClick={() => run("share")} className="h-12 rounded-sm font-mono tracking-widest uppercase">{busy ? "Making PDF" : "Share"}</Button>
          )}
          <Button size="lg" variant={canShareFiles ? "outline" : "default"} disabled={busy} onClick={() => run("download")} className="h-12 rounded-sm font-mono tracking-widest uppercase">{canShareFiles || !busy ? "Save PDF" : "Making PDF"}</Button>
          <Button variant="ghost" onClick={copy} className="font-mono underline underline-offset-4">Copy summary</Button>
          <p role="status" className="min-h-5 text-sm text-highlight">{status}</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
