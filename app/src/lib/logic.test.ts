import { describe, expect, it } from "vitest";
import { parseRecap } from "./recap";
import { route } from "./routing";
import { scanForRedFlag } from "./regions";
import type { IntakeAnswers, Profile } from "./types";

const weekdayNoon = new Date(2026, 9, 21, 12); // Wed 21 Oct 2026
const saturdayNight = new Date(2026, 9, 24, 22);

const base: IntakeAnswers = {
  regionId: "jaw-right",
  ownWords: "",
  onset: "4–7 days",
  severity: 6,
  modifiers: [],
  associated: [],
};
const profile: Profile = { name: "Ana", pronouns: "she/her", createdAt: "", prsiWorker: true, hasUterus: "yes" };

describe("recap parser", () => {
  it("parses Ana's dentist recap from the user journey", () => {
    const r = parseRecap(
      "The dentist said possible abscess. Amoxicillin 500 three times a day for 7 days. X-ray next week, come back if the swelling gets worse.",
      weekdayNoon,
    );
    expect(r.clinician).toBe("Dentist");
    expect(r.medicines).toEqual([{ name: "Amoxicillin", dose: "500 mg", frequency: "3 times a day", duration: "7 days" }]);
    expect(r.said).toEqual(["Possible abscess"]);
    expect(r.nextSteps.join(" ")).toMatch(/x-ray/i);
    expect(r.followUpDate).toBe("2026-10-28");
  });

  it("handles multiple medicines and relative follow-up", () => {
    const r = parseRecap(
      "GP thinks it's a urine infection. Nitrofurantoin 50mg four times a day for three days and paracetamol as needed. Come back in 2 weeks if not better.",
      weekdayNoon,
    );
    expect(r.clinician).toBe("GP");
    expect(r.medicines.map((m) => m.name)).toEqual(["Nitrofurantoin", "Paracetamol"]);
    expect(r.medicines[0]).toMatchObject({ dose: "50 mg", frequency: "4 times a day", duration: "3 days" });
    expect(r.medicines[1].frequency).toBe("As needed");
    expect(r.followUpDate).toBe("2026-11-04");
  });
});

describe("routing", () => {
  it("sends toothache to a dentist, not a GP", () => {
    expect(route({ ...base, associated: ["d-hotcold"] }, profile, weekdayNoon).door.id).toBe("dentist");
  });
  it("uses out-of-hours dental for urgent toothache on a Saturday night", () => {
    expect(route({ ...base, associated: ["d-swell"] }, profile, saturdayNight).door.id).toBe("dentalOOH");
  });
  it("mentions the PRSI check-up for PRSI workers", () => {
    const r = route(base, profile, weekdayNoon);
    expect(r.entitlements.some((e) => /PRSI/.test(e.text))).toBe(true);
  });
  it("sends uncomplicated UTI to a pharmacy (Rory journey is GP-first without uterus)", () => {
    const uti = { ...base, regionId: "bladder", associated: ["u-burn"] };
    expect(route(uti, profile, weekdayNoon).door.id).toBe("pharmacy");
    expect(route(uti, { ...profile, hasUterus: "no" }, weekdayNoon).door.id).toBe("gp");
    expect(route({ ...uti, associated: ["u-burn", "u-fever"] }, profile, weekdayNoon).door.id).toBe("gp");
  });
  it("routes a recent sprain to an injury unit", () => {
    expect(route({ ...base, regionId: "leg-left", associated: ["l-injury"] }, profile, weekdayNoon).door.id).toBe("injury");
  });
  it("routes severe pain out of hours to a GP co-op", () => {
    expect(route({ ...base, regionId: "abdomen-lower", severity: 9 }, profile, saturdayNight).door.id).toBe("gpcoop");
  });
});

describe("red-flag scan", () => {
  it("catches emergency phrases in free text", () => {
    expect(scanForRedFlag("my face swelling is spreading to my eye")).toBeTruthy();
    expect(scanForRedFlag("I can't breathe properly")).toBeTruthy();
    expect(scanForRedFlag("dull ache in my molar")).toBeUndefined();
  });
});
