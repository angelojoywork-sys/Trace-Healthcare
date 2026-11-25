import { SEVERITY, type Entry } from "./entries";
import type { FileRec } from "./files";

export type PackOptions = { name: string; includeName: boolean; includeNote: boolean; includeSaid: boolean };

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** The visit date if the user entered one, otherwise the day they logged the symptom. */
export const visitDay = (e: Entry): string => (e.visitDate ? longDate(`${e.visitDate}T12:00:00`) : longDate(e.createdAt));

export function summaryLines(e: Entry, o: PackOptions, files: FileRec[]): [string, string][] {
  const rows: [string, string][] = [];
  if (o.includeName && o.name.trim()) rows.push(["Name", o.name.trim()]);
  rows.push([e.visitDate ? "Visit date" : "Date logged", visitDay(e)]);
  if (e.gp?.trim()) rows.push(["GP", e.gp.trim()]);
  rows.push(["Symptom area", e.area]);
  rows.push(["Severity", SEVERITY[e.severity]]);
  if (o.includeNote && e.note.trim()) rows.push(["Symptom note", e.note.trim()]);
  if (o.includeSaid && e.gpSaid?.trim()) rows.push(["What the GP said", e.gpSaid.trim()]);
  if (files.length) rows.push(["Attached", files.map((f) => f.name).join(", ")]);
  return rows;
}

export const summaryText = (e: Entry, o: PackOptions, files: FileRec[]): string =>
  ["Visit summary", "", ...summaryLines(e, o, files).map(([k, v]) => `${k}: ${v}`), "", "Made with Trace. Not medical advice."].join("\n");

async function toJpeg(blob: Blob, max = 1600): Promise<{ url: string; w: number; h: number }> {
  const bmp = await createImageBitmap(blob);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  return { url: c.toDataURL("image/jpeg", 0.85), w, h };
}

/** One summary page, then each selected photo on its own page. PDFs cannot be merged here, so they are shared as separate files. */
export async function buildPdf(e: Entry, o: PackOptions, files: FileRec[]): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 22;
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text("Visit summary", 20, y); y += 12;
  for (const [k, v] of summaryLines(e, o, files)) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(110); doc.text(k.toUpperCase(), 20, y); y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(20);
    for (const line of doc.splitTextToSize(v, 170) as string[]) {
      if (y > 275) { doc.addPage(); y = 22; }
      doc.text(line, 20, y); y += 6;
    }
    y += 3;
  }
  doc.setFontSize(8); doc.setTextColor(130); doc.text("Made with Trace. Not medical advice.", 20, 289);
  for (const f of files.filter((x) => x.type.startsWith("image/"))) {
    const img = await toJpeg(f.blob);
    doc.addPage();
    doc.setFontSize(9); doc.setTextColor(110); doc.text(f.name, 20, 16);
    const s = Math.min(170 / img.w, 255 / img.h);
    doc.addImage(img.url, "JPEG", 20, 22, img.w * s, img.h * s);
  }
  return doc.output("blob");
}
