/** Ana's toothache (research/05-user-journeys.md), so reviewers can explore a filled-in app. */
import { parseRecap } from "./recap";
import { replaceAll, uid } from "./store";
import type { AppData, CheckIn, Episode, Visit } from "./types";

export function loadDemo(now = new Date()) {
  const ago = (days: number, hour = 10) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const ep1: Episode = {
    id: uid(),
    kind: "episode",
    createdAt: ago(26, 23).toISOString(),
    title: "Right jaw",
    door: "dentist",
    answers: {
      regionId: "jaw-right",
      ownWords: "Dull ache in my back molar for a few days. Throbbing at night and it goes up to my ear.",
      onset: "4–7 days",
      severity: 7,
      modifiers: ["Hot or cold drinks", "Lying down / at night"],
      associated: ["d-hotcold", "d-ear", "d-swell"],
    },
  };

  const recapText =
    "The dentist said possible abscess on the lower right molar. Amoxicillin 500 three times a day for 7 days and ibuprofen 400mg as needed. X-ray next week, come back in 2 weeks if not settled.";
  const visitDate = ago(25, 16);
  const parsed = parseRecap(recapText, visitDate);
  const v1: Visit = {
    id: uid(),
    kind: "visit",
    createdAt: visitDate.toISOString(),
    episodeId: ep1.id,
    rawText: recapText,
    ...parsed,
    // Keep the demo's follow-up in the near future so "Coming up" shows.
    followUpDate: ago(-3).toISOString().slice(0, 10),
    followUpNote: "Back to the dentist to review the X-ray",
    feeling: 2,
    feelingNote: "Sore, but relieved to know what it is",
  };

  const checkins: CheckIn[] = [
    { id: uid(), kind: "checkin", createdAt: ago(22, 20).toISOString(), feeling: 3, note: "Antibiotics kicking in" },
    { id: uid(), kind: "checkin", createdAt: ago(18, 20).toISOString(), feeling: 4 },
    { id: uid(), kind: "checkin", createdAt: ago(12, 20).toISOString(), feeling: 4 },
  ];

  const ep2: Episode = {
    id: uid(),
    kind: "episode",
    createdAt: ago(2, 21).toISOString(),
    title: "Right jaw",
    door: "dentist",
    answers: {
      regionId: "jaw-right",
      ownWords: "Same tooth is aching again, three weeks after the antibiotics. Not swollen this time.",
      onset: "It keeps coming back",
      severity: 5,
      modifiers: ["Chewing"],
      associated: ["d-bite", "d-ear"],
    },
  };
  ep1.resolved = true;

  const data: AppData = {
    version: 1,
    profile: { name: "Ana", pronouns: "she/her", ageBand: "17to35", prsiWorker: true, hasUterus: "yes", county: "Dublin", createdAt: ago(27).toISOString() },
    entries: [ep1, v1, ...checkins, ep2],
  };
  replaceAll(data);
}
