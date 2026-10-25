/**
 * Scripted Ireland routing. Rules only point to a door; they never name a condition
 * (design principle 1, "Ask, don't tell"). Facts cite research/01-desk-research.md.
 */
import { findOption, regionById } from "./regions";
import type { DoorId, IntakeAnswers, Profile } from "./types";

export interface Source {
  label: string;
  url: string;
}

export interface Door {
  id: DoorId;
  name: string;
  short: string;
  icon: string;
  cost: string;
  howTo: string;
  sources: Source[];
  mapsQuery?: string;
}

const S = {
  hseDentalGP: { label: "HSE advice for GPs on dental pain", url: "https://assets.hse.ie/media/documents/Advice_for_general_medical_practitioners_on_the_management_of_atraumatic_dental_pain.pdf" },
  hseDental: { label: "HSE dental services", url: "https://hse.ie/eng/services/list/2/dental" },
  ddh: { label: "HSE Dublin South City dental", url: "https://hse.ie/eng/services/list/1/lho/dubsouthcity/dental-and-orthodontic-services" },
  prsi: { label: "Irish Dental Association on the PRSI check-up", url: "https://dentist.ie/70-of-prsi-payers-missed-free-dental-check-up-last-year-irish-dental-association/" },
  injury: { label: "HSE: injury units and alternatives to ED", url: "https://about.hse.ie/news/injury-units-and-hospital-alternatives-in-cork/" },
  ccs: { label: "PSI: Common Conditions Service", url: "https://www.psi.ie/information-and-resources/common-conditions-service" },
  hseLive: { label: "HSE Live contact", url: "https://www2.hse.ie/services/contact-the-hse/" },
  gpCost: { label: "Irish Times: GP visit costs", url: "https://irishtimes.com/news/health/cost-of-gp-visit-varies-from-30-to-65-across-state-1.1860540" },
  contraception: { label: "HSE free contraception", url: "https://www2.hse.ie/services/sexual-health/free-contraception/" },
  ooh: { label: "HSE Kerry: alternatives to busy EDs", url: "https://about.hse.ie/news/caring-for-kerry-your-alternatives-to-busy-emergency-departments/" },
};

export const DOORS: Record<DoorId, Door> = {
  emergency: {
    id: "emergency",
    name: "Call 112 or 999",
    short: "Emergency",
    icon: "🚨",
    cost: "Free to call.",
    howTo: "Call now. Say where you are and what's happening.",
    sources: [],
  },
  ed: {
    id: "ed",
    name: "Emergency department (ED)",
    short: "ED",
    icon: "🏥",
    cost: "There may be a charge if you go without a GP letter or medical card. Ask at reception.",
    howTo: "Go to your nearest ED. Bring your medicines list, or open Show my doctor.",
    sources: [S.ooh],
    mapsQuery: "emergency department",
  },
  injury: {
    id: "injury",
    name: "Injury unit",
    short: "Injury unit",
    icon: "🩹",
    cost: "Fees vary. Ask when you arrive. Medical card holders are usually covered.",
    howTo: "For recent injuries that aren't life-threatening: sprains, small cuts, possible broken bones in arms or legs. Usually faster than an ED.",
    sources: [S.injury],
    mapsQuery: "injury unit",
  },
  gpcoop: {
    id: "gpcoop",
    name: "Out-of-hours GP (GP co-op)",
    short: "GP co-op",
    icon: "🌙",
    cost: "Usually a fee, unless you have a medical card or GP visit card. Check when you ring.",
    howTo: "Ring first; most co-ops see you by appointment only. Examples: SouthDoc 0818 355 999 (Cork and Kerry), Caredoc (south-east), MIDOC (midlands). Not sure which one covers you? Ring HSE Live on 1800 700 700.",
    sources: [S.ooh, S.hseLive],
  },
  gp: {
    id: "gp",
    name: "GP (family doctor)",
    short: "GP",
    icon: "🩺",
    cost: "Private visits usually cost €40–€80. Free with a medical card or GP visit card, and for under-8s and over-70s.",
    howTo: "Ring your GP. If you don't have one, or the lists near you are full, HSE Live (1800 700 700) can help you find one.",
    sources: [S.gpCost, S.hseLive],
    mapsQuery: "GP practice",
  },
  dentist: {
    id: "dentist",
    name: "Dentist",
    short: "Dentist",
    icon: "🦷",
    cost: "Private fees vary, so ask when you ring. With a medical card, say \"medical card\" when booking (DTSS). If you've paid PRSI, your check-up may be free.",
    howTo: "Dental pain is usually fixed by a dental procedure, not by a prescription, so a dentist is the right first stop rather than a GP.",
    sources: [S.hseDentalGP, S.hseDental, S.prsi],
    mapsQuery: "dentist",
  },
  dentalOOH: {
    id: "dentalOOH",
    name: "Out-of-hours dental help",
    short: "OOH dental",
    icon: "🦷",
    cost: "Fees vary.",
    howTo: "Out-of-hours dental cover is thin. In Dublin, the Dublin Dental Hospital weekend and bank holiday line (01 612 7200) is for severe emergencies only. Elsewhere, ring your own dentist's out-of-hours message, or a GP co-op for pain relief until a dentist can see you. If the swelling spreads, go to an ED.",
    sources: [S.ddh, S.hseDentalGP],
  },
  pharmacy: {
    id: "pharmacy",
    name: "Pharmacy",
    short: "Pharmacy",
    icon: "💊",
    cost: "Advice is free. Ask about any consultation fee and the cost of medicines.",
    howTo: "No appointment needed. Pharmacists can now prescribe for 8 common conditions: hay fever, cold sores, conjunctivitis, oral thrush, shingles, impetigo, uncomplicated UTI and vulvovaginal thrush.",
    sources: [S.ccs],
    mapsQuery: "pharmacy",
  },
  selfcare: {
    id: "selfcare",
    name: "Self-care, with a pharmacist's advice",
    short: "Self-care",
    icon: "🏠",
    cost: "Pharmacy advice is free.",
    howTo: "This often settles with rest, fluids and over-the-counter relief. A pharmacist can suggest what to take.",
    sources: [S.ccs],
    mapsQuery: "pharmacy",
  },
};

export interface RouteResult {
  door: Door;
  urgency: string;
  why: string[];
  entitlements: { text: string; source?: Source }[];
  safetyNet: string[];
  alsoConsider?: Door;
  outOfHours: boolean;
  disclaimer: string;
}

export function isOutOfHours(d = new Date()) {
  const day = d.getDay();
  const h = d.getHours();
  // Typical GP/dental surgery hours are Mon–Fri ~9–6 [assumption; varies by practice].
  return day === 0 || day === 6 || h < 9 || h >= 18;
}

function tagsOf(a: IntakeAnswers) {
  const tags = new Set<string>();
  for (const id of a.associated) findOption(id)?.tags?.forEach((t) => tags.add(t));
  return tags;
}

export function route(a: IntakeAnswers, profile: Profile | undefined, now = new Date()): RouteResult {
  const region = regionById(a.regionId);
  const group = region?.group ?? "general";
  const tags = tagsOf(a);
  const ooh = isOutOfHours(now);
  const sev = a.severity;
  const why: string[] = [];
  const safetyNet: string[] = [
    "If anything gets suddenly worse, or you notice any warning sign, call 112 or 999.",
  ];
  let door: DoorId = "gp";
  let urgency = "Within the next few days";
  let alsoConsider: DoorId | undefined;

  const ccs = [...tags].find((t) => t.startsWith("ccs:"))?.slice(4);
  const complicated = tags.has("complicated") || tags.has("fever");
  const longRunning = a.onset === "Over a month" || a.onset === "It keeps coming back";

  if (group === "dental" || (tags.has("dental") && group !== "ear" && group !== "faceHead")) {
    const urgent = tags.has("urgentDental") || sev >= 7;
    door = urgent && ooh ? "dentalOOH" : "dentist";
    urgency = urgent ? (ooh ? "Tonight or first thing tomorrow" : "Today if you can") : "Within 1–3 days";
    why.push("Pain in the teeth, gums or jaw needs a dental opinion. A dentist can treat the cause, while a GP can only help with pain for now.");
    if (tags.has("urgentDental")) why.push("Swelling, fever or pus means you shouldn't wait for a routine appointment.");
    if (tags.has("mimic")) why.push("Tooth pain can spread to the ear or temple, and ear or sinus pain can feel like toothache. If the dentist finds nothing, see a GP next.");
    if (tags.has("tmj")) alsoConsider = "gp";
    safetyNet.push("If the swelling spreads toward your eye, neck or under your tongue, or you can't swallow, go to an ED now.");
  } else if (tags.has("dental")) {
    door = "dentist";
    urgency = "Within 1–3 days";
    alsoConsider = "gp";
    why.push("You mentioned your teeth ache too. Sinus or ear problems and toothache can feel alike, so it's worth ruling out your teeth first.");
  } else if (tags.has("injury") && (group === "limb" || group === "back" || group === "eye" || group === "faceHead")) {
    door = "injury";
    urgency = "Today";
    why.push("For a recent injury that isn't life-threatening, an injury unit is usually faster than an ED.");
    if (tags.has("injury") && group === "eye") alsoConsider = "ed";
  } else if (tags.has("uti") && !complicated) {
    const canPharmacy = profile?.hasUterus === "yes";
    door = canPharmacy ? "pharmacy" : "gp";
    urgency = "Today or tomorrow";
    why.push(
      canPharmacy
        ? "Pharmacists can now treat uncomplicated urine infections under the Common Conditions Service, with no appointment needed."
        : "A pharmacist can treat some urine infections, but it depends on your body and history, so a GP is the safest first stop. A pharmacist can tell you if they can help.",
    );
    if (!canPharmacy) alsoConsider = "pharmacy";
    safetyNet.push("If you get a fever, back or side pain, or blood in your pee, see a GP today.");
  } else if (ccs && !complicated && sev < 8) {
    door = "pharmacy";
    urgency = "Today or tomorrow";
    why.push(`This sounds like something a pharmacist can help with. "${ccs}" is one of the conditions pharmacists can now prescribe for.`);
    safetyNet.push("If it's not improving after the pharmacist's treatment, see a GP.");
  } else if (tags.has("contraception")) {
    door = "gp";
    urgency = "Soon. For emergency contraception, go today; a pharmacy can help without an appointment.";
    alsoConsider = "pharmacy";
    why.push("A GP can talk you through options. Emergency contraception is available from pharmacies.");
  } else if (tags.has("gpUrgent") || sev >= 9) {
    door = ooh ? "gpcoop" : "gp";
    urgency = "Today";
    alsoConsider = "ed";
    why.push(sev >= 9 ? "You rated this 9 or 10, so it should be seen today." : "What you've described should be checked by a doctor today.");
  } else if (tags.has("gpSoon") || complicated || sev >= 7) {
    door = ooh && sev >= 7 ? "gpcoop" : "gp";
    urgency = "Within 24 hours";
    why.push("A doctor should look at this soon rather than waiting.");
  } else if (tags.has("pharmacy") || tags.has("selfcare")) {
    door = tags.has("selfcare") && !longRunning ? "selfcare" : "pharmacy";
    urgency = "When convenient";
    alsoConsider = "gp";
    why.push("A pharmacist is a good first stop. They'll tell you if you need to see a GP.");
    safetyNet.push("If you're no better in a week, or it keeps coming back, book a GP.");
  } else {
    door = "gp";
    urgency = longRunning ? "Book in the next week or two" : "Within a few days";
    why.push("A GP is the right place to start for this.");
  }

  if (longRunning) {
    why.push("This has been going on a while or keeps coming back. Your Trace timeline helps the doctor see the pattern, so show it at the appointment.");
  }
  if (tags.has("cycle")) {
    why.push("Pain linked to your cycle that stops you doing normal things is worth raising. You don't have to put up with it.");
  }
  if (group === "mind") {
    safetyNet.unshift("You can talk to Samaritans any time, free, on 116 123.");
  }

  return {
    door: DOORS[door],
    urgency,
    why,
    entitlements: entitlementsFor(door, profile, tags),
    safetyNet,
    alsoConsider: alsoConsider ? DOORS[alsoConsider] : undefined,
    outOfHours: ooh,
    disclaimer:
      "Trace gives general information from public HSE and other Irish sources. It does not diagnose. If you're unsure, ring a pharmacist, your GP, or HSE Live on 1800 700 700.",
  };
}

function entitlementsFor(door: DoorId, p: Profile | undefined, tags: Set<string>) {
  const out: { text: string; source?: Source }[] = [];
  if (!p) return out;
  const gpCovered = p.medicalCard || p.gpVisitCard || p.ageBand === "under8" || p.ageBand === "70plus";
  if ((door === "gp" || door === "gpcoop") && gpCovered) {
    out.push({ text: "Your GP visit should be free with your card or at your age. Mention it when you book.", source: S.gpCost });
  }
  if ((door === "dentist" || door === "dentalOOH") && p.medicalCard) {
    out.push({ text: "With a medical card you can get dental treatment under the DTSS from participating dentists. Say \"medical card\" when you book.", source: S.hseDental });
  }
  if ((door === "dentist" || door === "dentalOOH") && p.prsiWorker && !p.medicalCard) {
    out.push({ text: "If you've paid enough PRSI, your yearly dental check-up is free. About 70% of people who can get it don't use it.", source: S.prsi });
  }
  if (tags.has("contraception") && p.ageBand === "17to35") {
    out.push({ text: "At 17–35 the Free Contraception Scheme covers the GP visit and the prescription. You don't need a medical card.", source: S.contraception });
  }
  if (door === "pharmacy") {
    out.push({ text: "Pharmacy advice is free, and you don't need an appointment.", source: S.ccs });
  }
  return out;
}
