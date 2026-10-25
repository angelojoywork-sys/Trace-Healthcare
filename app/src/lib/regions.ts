/**
 * Body regions and the scripted questions for each.
 * Every symptom option is either a red flag (interrupts everything) or a routing hint.
 * Sources are the D-numbers in research/01-desk-research.md.
 */

export type Group =
  | "dental"
  | "faceHead"
  | "eye"
  | "ear"
  | "throat"
  | "chest"
  | "abdomen"
  | "pelvic"
  | "urinary"
  | "back"
  | "limb"
  | "skin"
  | "general"
  | "mind";

export interface Region {
  id: string;
  label: string;
  group: Group;
}

export interface SymptomOption {
  id: string;
  label: string;
  /** If set, choosing it triggers the red-flag screen with this reason. */
  redFlag?: string;
  /** Free-form tags the routing engine reads. */
  tags?: string[];
}

export const REGIONS: Region[] = [
  // face detail (founding story: toothache)
  { id: "teeth-upper", label: "Upper teeth", group: "dental" },
  { id: "teeth-lower", label: "Lower teeth", group: "dental" },
  { id: "jaw-left", label: "Left jaw", group: "dental" },
  { id: "jaw-right", label: "Right jaw", group: "dental" },
  { id: "gums-mouth", label: "Gums, tongue or inside mouth", group: "dental" },
  { id: "forehead", label: "Forehead or head", group: "faceHead" },
  { id: "eyes", label: "Eyes", group: "eye" },
  { id: "ear-left", label: "Left ear", group: "ear" },
  { id: "ear-right", label: "Right ear", group: "ear" },
  { id: "nose-sinus", label: "Nose or sinuses", group: "faceHead" },
  { id: "cheek-left", label: "Left cheek", group: "faceHead" },
  { id: "cheek-right", label: "Right cheek", group: "faceHead" },
  { id: "lips", label: "Lips", group: "skin" },
  { id: "throat", label: "Throat or neck", group: "throat" },
  // body
  { id: "chest", label: "Chest", group: "chest" },
  { id: "abdomen-upper", label: "Upper tummy", group: "abdomen" },
  { id: "abdomen-lower", label: "Lower tummy", group: "abdomen" },
  { id: "pelvis", label: "Pelvis, genitals or periods", group: "pelvic" },
  { id: "bladder", label: "Peeing (bladder)", group: "urinary" },
  { id: "back-upper", label: "Upper back", group: "back" },
  { id: "back-lower", label: "Lower back", group: "back" },
  { id: "arm-left", label: "Left arm or hand", group: "limb" },
  { id: "arm-right", label: "Right arm or hand", group: "limb" },
  { id: "leg-left", label: "Left leg or foot", group: "limb" },
  { id: "leg-right", label: "Right leg or foot", group: "limb" },
  { id: "skin", label: "Skin or rash", group: "skin" },
  { id: "general", label: "All over (fever, tiredness, allergies)", group: "general" },
  { id: "mind", label: "Mood, worry or sleep", group: "mind" },
];

export const regionById = (id: string) => REGIONS.find((r) => r.id === id);

/** Universal red flags: always offered, whatever the region (brief: "red flags always win"). */
export const UNIVERSAL_RED_FLAGS: SymptomOption[] = [
  { id: "rf-breath", label: "Struggling to breathe", redFlag: "Difficulty breathing" },
  { id: "rf-chest", label: "Crushing chest pain, or pain spreading to arm, jaw or back", redFlag: "Possible heart problem" },
  { id: "rf-stroke", label: "Face drooping, arm weakness or slurred speech", redFlag: "Possible stroke (FAST signs)" },
  { id: "rf-bleed", label: "Heavy bleeding that won't stop", redFlag: "Heavy bleeding" },
  { id: "rf-collapse", label: "Fainted, very drowsy or confused", redFlag: "Collapse or confusion" },
];

const dental: SymptomOption[] = [
  { id: "d-swell-spread", label: "Swelling spreading to eye, neck or under the tongue", redFlag: "Spreading facial swelling" },
  { id: "d-swallow", label: "Hard to swallow or open your mouth", redFlag: "Trouble swallowing" },
  { id: "d-swell", label: "Some swelling in gum or face", tags: ["urgentDental"] },
  { id: "d-fever", label: "Fever or feeling hot and shivery", tags: ["urgentDental", "fever"] },
  { id: "d-hotcold", label: "Hurts with hot, cold or sweet things", tags: ["dental"] },
  { id: "d-bite", label: "Hurts when biting", tags: ["dental"] },
  { id: "d-taste", label: "Bad taste or pus", tags: ["urgentDental"] },
  { id: "d-broken", label: "Broken or knocked tooth", tags: ["dental", "injury"] },
  { id: "d-ear", label: "Pain spreads to ear or temple", tags: ["dental", "mimic"] },
  { id: "d-clicking", label: "Jaw clicks or locks", tags: ["tmj"] },
];

const faceHead: SymptomOption[] = [
  { id: "h-thunder", label: "Sudden, worst-ever headache", redFlag: "Sudden severe headache" },
  { id: "h-injury-confused", label: "Hit your head and now confused or vomiting", redFlag: "Head injury with warning signs" },
  { id: "h-stiff", label: "Stiff neck with fever or a rash", redFlag: "Possible meningitis" },
  { id: "h-sinus", label: "Blocked nose, pressure behind cheeks", tags: ["gp"] },
  { id: "h-teeth", label: "Upper teeth ache too", tags: ["mimic", "dental"] },
  { id: "h-light", label: "Light hurts, feel sick", tags: ["gp"] },
  { id: "h-coldsore", label: "Tingling blister on lip", tags: ["ccs:Cold sores"] },
];

const eye: SymptomOption[] = [
  { id: "e-vision", label: "Sudden loss of vision", redFlag: "Sudden vision loss" },
  { id: "e-injury", label: "Something hit or went into the eye", tags: ["injury"] },
  { id: "e-sticky", label: "Red, gritty or sticky eye", tags: ["ccs:Conjunctivitis"] },
  { id: "e-itch", label: "Itchy, watery eyes with sneezing", tags: ["ccs:Hay fever"] },
  { id: "e-pain", label: "Painful eye, light hurts", tags: ["gpSoon"] },
];

const ear: SymptomOption[] = [
  { id: "ear-swell", label: "Swelling or redness behind the ear", tags: ["gpSoon"] },
  { id: "ear-discharge", label: "Discharge from the ear", tags: ["gp"] },
  { id: "ear-hearing", label: "Hearing loss", tags: ["gp"] },
  { id: "ear-teeth", label: "Back teeth or jaw ache too", tags: ["mimic", "dental"] },
  { id: "ear-fever", label: "Fever", tags: ["gp", "fever"] },
];

const throat: SymptomOption[] = [
  { id: "t-drool", label: "Can't swallow saliva, drooling", redFlag: "Possible airway problem" },
  { id: "t-swell", label: "Swollen glands", tags: ["gp"] },
  { id: "t-fever", label: "Fever", tags: ["gp", "fever"] },
  { id: "t-white", label: "White patches in mouth", tags: ["ccs:Oral thrush"] },
  { id: "t-cough", label: "Cough or cold", tags: ["selfcare"] },
];

const chest: SymptomOption[] = [
  { id: "c-sweat", label: "Pain with sweating or feeling sick", redFlag: "Possible heart problem" },
  { id: "c-cough-blood", label: "Coughing up blood", redFlag: "Coughing up blood" },
  { id: "c-breath", label: "A bit short of breath", tags: ["gpSoon"] },
  { id: "c-cough", label: "Cough", tags: ["gp"] },
  { id: "c-move", label: "Hurts when pressing or moving", tags: ["gp"] },
  { id: "c-heartburn", label: "Burning after meals", tags: ["pharmacy"] },
];

const abdomen: SymptomOption[] = [
  { id: "a-rigid", label: "Severe pain, tummy hard to touch", redFlag: "Severe abdominal pain" },
  { id: "a-blood", label: "Vomiting blood or black poo", redFlag: "Internal bleeding signs" },
  { id: "a-rightlow", label: "Pain moved to lower right, worse when moving", tags: ["gpUrgent"] },
  { id: "a-vomit", label: "Vomiting or diarrhoea", tags: ["selfcare"] },
  { id: "a-fever", label: "Fever", tags: ["gp", "fever"] },
  { id: "a-heartburn", label: "Heartburn or indigestion", tags: ["pharmacy"] },
  { id: "a-cycle", label: "Linked to your period", tags: ["cycle", "gp"] },
];

const pelvic: SymptomOption[] = [
  { id: "p-pregpain", label: "Severe one-sided pain and could be pregnant", redFlag: "Possible ectopic pregnancy" },
  { id: "p-heavy", label: "Soaking a pad or tampon every hour", redFlag: "Heavy bleeding" },
  { id: "p-thrush", label: "Itching with thick white discharge", tags: ["ccs:Vulvovaginal thrush"] },
  { id: "p-periodpain", label: "Period pain that stops you doing things", tags: ["cycle", "gp"] },
  { id: "p-contra", label: "Need contraception or emergency contraception", tags: ["contraception"] },
  { id: "p-lump", label: "A lump or new pain in testicles", tags: ["gpSoon"] },
  { id: "p-discharge", label: "Unusual discharge or sores", tags: ["gp", "sti"] },
];

const urinary: SymptomOption[] = [
  { id: "u-burn", label: "Burning or stinging when peeing", tags: ["uti"] },
  { id: "u-often", label: "Needing to pee often", tags: ["uti"] },
  { id: "u-blood", label: "Blood in pee", tags: ["gp", "complicated"] },
  { id: "u-back", label: "Pain in your back or side", tags: ["gpSoon", "complicated"] },
  { id: "u-fever", label: "Fever or shivering", tags: ["gpSoon", "fever", "complicated"] },
];

const back: SymptomOption[] = [
  { id: "b-numb", label: "Numb between the legs or can't control pee/poo", redFlag: "Possible spinal cord compression" },
  { id: "b-injury", label: "Started after a fall or injury", tags: ["injury"] },
  { id: "b-leg", label: "Pain goes down the leg", tags: ["gp"] },
  { id: "b-fever", label: "Fever", tags: ["gpSoon", "fever"] },
  { id: "b-stiff", label: "Stiff, aching muscles", tags: ["selfcare"] },
];

const limb: SymptomOption[] = [
  { id: "l-deform", label: "Bone looks out of place or is showing", redFlag: "Serious injury" },
  { id: "l-calf", label: "Hot, swollen, painful calf", tags: ["gpUrgent"] },
  { id: "l-injury", label: "Recent fall, twist or knock", tags: ["injury"] },
  { id: "l-cant-weight", label: "Can't put weight on it or use it", tags: ["injury"] },
  { id: "l-joint", label: "Joint pain or swelling, no injury", tags: ["gp"] },
];

const skin: SymptomOption[] = [
  { id: "s-glass", label: "Rash that doesn't fade under a glass, with fever", redFlag: "Possible meningitis or sepsis" },
  { id: "s-swell-face", label: "Lips or tongue swelling suddenly", redFlag: "Possible severe allergic reaction" },
  { id: "s-coldsore", label: "Cold sore", tags: ["ccs:Cold sores"] },
  { id: "s-crust", label: "Golden crusty patches (often on face)", tags: ["ccs:Impetigo"] },
  { id: "s-band", label: "Painful band of blisters on one side", tags: ["ccs:Shingles"] },
  { id: "s-red-hot", label: "Red, hot, spreading skin", tags: ["gpUrgent"] },
  { id: "s-itch", label: "Itchy rash", tags: ["pharmacy"] },
];

const general: SymptomOption[] = [
  { id: "g-sepsis", label: "Very unwell: mottled skin, cold hands, not peeing", redFlag: "Possible sepsis" },
  { id: "g-hayfever", label: "Sneezing, itchy eyes, runny nose", tags: ["ccs:Hay fever"] },
  { id: "g-fever", label: "Fever for more than 3 days", tags: ["gp", "fever"] },
  { id: "g-tired", label: "Tired all the time for weeks", tags: ["gp"] },
  { id: "g-weight", label: "Losing weight without trying", tags: ["gp"] },
  { id: "g-cold", label: "Cold or flu symptoms", tags: ["selfcare"] },
];

const mind: SymptomOption[] = [
  { id: "m-harm", label: "Thinking about ending your life or harming yourself", redFlag: "You deserve support right now" },
  { id: "m-panic", label: "Panic attacks", tags: ["gp"] },
  { id: "m-low", label: "Low mood most days for 2+ weeks", tags: ["gp"] },
  { id: "m-sleep", label: "Trouble sleeping", tags: ["gp"] },
];

export const SYMPTOMS: Record<Group, SymptomOption[]> = {
  dental,
  faceHead,
  eye,
  ear,
  throat,
  chest,
  abdomen,
  pelvic,
  urinary,
  back,
  limb,
  skin,
  general,
  mind,
};

export const MODIFIERS: Record<string, string[]> = {
  dental: ["Hot or cold drinks", "Chewing", "Lying down / at night", "Painkillers help", "Nothing helps"],
  default: ["Moving", "Rest", "Eating", "At night", "Painkillers help", "Nothing helps"],
};

export const ONSETS = [
  "Today",
  "1–3 days",
  "4–7 days",
  "1–4 weeks",
  "Over a month",
  "It keeps coming back",
];

/** Words in free text that should interrupt immediately, before any question. */
const RED_FLAG_PHRASES: [RegExp, string][] = [
  [/can'?t breathe|cannot breathe|struggling to breathe|choking/i, "Difficulty breathing"],
  [/chest (pain|tight)|crushing/i, "Possible heart problem"],
  [/face (is )?droop|slurred|can'?t lift (my )?arm/i, "Possible stroke (FAST signs)"],
  [/swelling (is )?spreading|swollen (to|up to) (my )?eye|swelling.*neck/i, "Spreading facial swelling"],
  [/can'?t swallow/i, "Trouble swallowing"],
  [/worst headache|thunderclap/i, "Sudden severe headache"],
  [/suicid|kill myself|end (my|it all)|want to die|self[- ]?harm/i, "You deserve support right now"],
  [/won'?t stop bleeding|bleeding heavily|lots of blood/i, "Heavy bleeding"],
  [/passed out|fainted|unconscious/i, "Collapse or confusion"],
];

export function scanForRedFlag(text: string): string | undefined {
  for (const [re, reason] of RED_FLAG_PHRASES) if (re.test(text)) return reason;
  return undefined;
}

export function optionsFor(regionId: string): SymptomOption[] {
  const r = regionById(regionId);
  return r ? SYMPTOMS[r.group] : SYMPTOMS.general;
}

export function findOption(id: string): SymptomOption | undefined {
  for (const list of [...Object.values(SYMPTOMS), UNIVERSAL_RED_FLAGS]) {
    const hit = list.find((o) => o.id === id);
    if (hit) return hit;
  }
  return undefined;
}
