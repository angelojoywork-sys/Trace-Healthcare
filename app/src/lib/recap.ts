/**
 * Rule-based "voice note → structured summary". Deliberately simple and predictable:
 * the user always reviews and edits the result (design principle 4, "Capture now, tidy later").
 */
import type { Medicine } from "./types";

export interface ParsedRecap {
  clinician: string;
  said: string[];
  medicines: Medicine[];
  nextSteps: string[];
  followUpDate?: string;
  followUpNote?: string;
}

const KNOWN_MEDS = [
  "amoxicillin", "co-amoxiclav", "augmentin", "penicillin", "phenoxymethylpenicillin", "metronidazole",
  "clarithromycin", "doxycycline", "flucloxacillin", "nitrofurantoin", "trimethoprim", "fosfomycin",
  "fluconazole", "clotrimazole", "aciclovir", "valaciclovir", "chlorhexidine", "corsodyl",
  "ibuprofen", "nurofen", "paracetamol", "panadol", "solpadeine", "naproxen", "diclofenac", "codeine",
  "tramadol", "mefenamic acid", "ponstan", "omeprazole", "lansoprazole", "gaviscon", "cetirizine",
  "loratadine", "fexofenadine", "prednisolone", "salbutamol", "sertraline", "citalopram", "fluoxetine",
  "mirtazapine", "levothyroxine", "metformin", "ferrous sulphate", "iron", "vitamin d", "folic acid",
  "tranexamic acid", "norethisterone", "microgynon", "cerazette", "mupirocin", "fusidic acid",
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fourteen: 14, couple: 2, few: 3,
};

const toNum = (s: string) => (/^\d+$/.test(s) ? parseInt(s, 10) : NUMBER_WORDS[s.toLowerCase()] ?? NaN);

const FREQ: [RegExp, string][] = [
  [/\b(three|3) times (a|per|each) day\b|\btds\b|\btid\b/i, "3 times a day"],
  [/\b(four|4) times (a|per|each) day\b|\bqds\b/i, "4 times a day"],
  [/\b(twice|two times|2 times) (a|per|each) day\b|\bbd\b|\bbid\b/i, "Twice a day"],
  [/\b(once|one time) (a|per|each) day\b|\bdaily\b|\bevery day\b|\bod\b/i, "Once a day"],
  [/\bevery (\d+|four|six|eight|twelve) hours\b/i, "every $1 hours"],
  [/\bat night\b|\bbefore bed\b/i, "At night"],
  [/\bas needed\b|\bwhen needed\b|\bif needed\b|\bprn\b/i, "As needed"],
];

const CLINICIANS: [RegExp, string][] = [
  [/\bdentist\b|\bdental\b/i, "Dentist"],
  [/\bpharmacist\b|\bchemist\b|\bpharmacy\b/i, "Pharmacist"],
  [/\bnurse\b/i, "Nurse"],
  [/\bconsultant\b|\bspecialist\b|\bgynae|\bhospital\b/i, "Consultant / hospital"],
  [/\bphysio/i, "Physiotherapist"],
  [/\bgp\b|\bdoctor\b|\bdoc\b/i, "GP"],
];

const SAID_CUE = /\b(said|says|thinks|think|told|reckons|explained|possible|possibly|probably|might be|could be|looks like|diagnos|it'?s an?|it is an?|infection|abscess|nothing serious)\b/i;
const NEXT_CUE = /\b(x-?ray|scan|blood test|bloods|swab|referr?al|refer|book|come back|go back|return|appointment|follow[- ]?up|check[- ]?up|avoid|keep|rinse|rest|ice|stop taking|see (a|the)|ring)\b/i;

// "The dentist said possible abscess" → "Possible abscess": the clinician is already recorded.
const SAID_PREFIX = /^(?:(?:the|my) )?(?:she|he|they|dentist|gp|doctor|doc|nurse|pharmacist|consultant) (?:said|says|told me|thinks|reckons)(?: that)?\s*/i;

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?;])\s+|\s+(?:and then|then|also|and she|and he|and they)\s+/i)
    .flatMap((s) => s.split(/,\s*(?=(?:she|he|they|i|come|go|book|take|and)\b)/i))
    .map((s) => s.trim().replace(/^(and|so|but)\s+/i, "").replace(/[.;,]+$/, ""))
    .filter((s) => s.length > 2);
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseMedicines(text: string): Medicine[] {
  const meds: Medicine[] = [];
  const lower = text.toLowerCase();
  const seen = new Set<string>();

  const found: { name: string; index: number }[] = [];
  for (const m of KNOWN_MEDS) {
    const re = new RegExp(`\\b${m.replace(/[-]/g, "[- ]?")}\\b`, "gi");
    let hit: RegExpExecArray | null;
    while ((hit = re.exec(lower))) found.push({ name: m, index: hit.index });
  }
  // Unknown names followed by a dose, e.g. "zyrtec 10mg"
  const doseRe = /\b([a-z][a-z-]{3,})\s+(\d+(?:\.\d+)?)\s?(mg|mcg|micrograms|g|ml)\b/gi;
  let dm: RegExpExecArray | null;
  while ((dm = doseRe.exec(lower))) {
    if (!found.some((f) => Math.abs(f.index - dm!.index) < 3) && !/^(take|takes|taking|of|the|some)$/.test(dm[1])) {
      found.push({ name: dm[1], index: dm.index });
    }
  }
  found.sort((a, b) => a.index - b.index);

  found.forEach((f, i) => {
    if (seen.has(f.name)) return;
    seen.add(f.name);
    const end = found[i + 1]?.index ?? Math.min(lower.length, f.index + 140);
    const window = text.slice(f.index, end);
    // Spoken doses often drop the unit ("amoxicillin 500"); assume mg for a bare 2–4 digit number.
    const dose =
      window.match(/(\d+(?:\.\d+)?)\s?(mg|mcg|micrograms|g|ml)\b/i) ??
      window.match(/\b(\d{2,4})\b(?!\s?(?:days?|weeks?|months?|times|hours|x\b))()/i)?.map((v, i) => (i === 2 ? "mg" : v));
    let frequency = "";
    for (const [re, label] of FREQ) {
      const m = window.match(re);
      if (m) {
        frequency = label.replace("$1", m[1] ?? "");
        break;
      }
    }
    const dur = window.match(/\bfor (?:(?:a|an)\s)?(\d+|one|two|three|four|five|six|seven|ten|fourteen|a)?\s?(days?|weeks?|months?)\b/i);
    let duration = "";
    if (dur) {
      const n = dur[1] ? toNum(dur[1]) : 1;
      duration = `${Number.isNaN(n) ? 1 : n} ${dur[2].replace(/s$/, "")}${n === 1 ? "" : "s"}`;
    }
    meds.push({
      name: cap(f.name),
      dose: dose ? `${dose[1]} ${dose[2].toLowerCase()}` : "",
      frequency,
      duration,
    });
  });
  return meds;
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function parseFollowUp(text: string, from = new Date()): { date?: string; note?: string } {
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const lower = text.toLowerCase();
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const sentence =
    splitSentences(text).find((s) => /\b(come back|go back|return|follow[- ]?up|review|see (you|me|her|him|them)|appointment|in \w+ (days?|weeks?))\b/i.test(s));

  const rel = lower.match(/\bin (?:(a|an|one|two|three|four|five|six|\d+|a couple of|a few)\s)?(days?|weeks?|months?)\b/);
  if (rel) {
    const raw = (rel[1] ?? "a").replace("a couple of", "couple").replace("a few", "few");
    const n = toNum(raw);
    const d = new Date(base);
    if (rel[2].startsWith("day")) d.setDate(d.getDate() + n);
    else if (rel[2].startsWith("week")) d.setDate(d.getDate() + 7 * n);
    else d.setMonth(d.getMonth() + n);
    return { date: iso(d), note: sentence };
  }
  const wd = lower.match(/\b(next )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (wd && sentence) {
    const target = WEEKDAYS.indexOf(wd[2]);
    const d = new Date(base);
    let add = (target - d.getDay() + 7) % 7 || 7;
    if (wd[1] && add < 7) add += 7;
    d.setDate(d.getDate() + add);
    return { date: iso(d), note: sentence };
  }
  if (/\bnext week\b/.test(lower)) {
    const d = new Date(base);
    d.setDate(d.getDate() + 7);
    return { date: iso(d), note: sentence };
  }
  return { note: sentence };
}

export function parseRecap(text: string, from = new Date()): ParsedRecap {
  let clinician = "";
  for (const [re, label] of CLINICIANS) if (re.test(text)) { clinician = label; break; }

  const sentences = splitSentences(text);
  const medNames = KNOWN_MEDS;
  const said: string[] = [];
  const nextSteps: string[] = [];
  for (const s of sentences) {
    const isMedOnly = medNames.some((m) => s.toLowerCase().includes(m)) && !SAID_CUE.test(s);
    if (isMedOnly) continue;
    if (NEXT_CUE.test(s)) nextSteps.push(cap(s));
    else if (SAID_CUE.test(s)) said.push(cap(s.replace(SAID_PREFIX, "")));
  }

  const fu = parseFollowUp(text, from);
  return {
    clinician,
    said,
    medicines: parseMedicines(text),
    nextSteps,
    followUpDate: fu.date,
    followUpNote: fu.note ? cap(fu.note) : undefined,
  };
}
