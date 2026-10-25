export type Feeling = 1 | 2 | 3 | 4 | 5;

export interface Profile {
  name: string;
  pronouns: string;
  ageBand?: "under8" | "8to16" | "17to35" | "36to69" | "70plus";
  medicalCard?: boolean;
  gpVisitCard?: boolean;
  prsiWorker?: boolean;
  /** Anatomy-first, optional. Only asked when relevant. */
  hasUterus?: "yes" | "no" | "skip";
  county?: string;
  createdAt: string;
}

export type DoorId =
  | "emergency"
  | "ed"
  | "injury"
  | "gpcoop"
  | "gp"
  | "dentist"
  | "dentalOOH"
  | "pharmacy"
  | "selfcare";

export interface IntakeAnswers {
  regionId: string;
  ownWords: string;
  onset: string;
  severity: number;
  modifiers: string[];
  associated: string[];
  pregnantPossible?: "yes" | "no" | "skip";
}

export interface Episode {
  id: string;
  kind: "episode";
  createdAt: string;
  title: string;
  answers: IntakeAnswers;
  door: DoorId;
  redFlag?: string;
  resolved?: boolean;
}

export interface Medicine {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

export interface Visit {
  id: string;
  kind: "visit";
  createdAt: string;
  episodeId?: string;
  clinician: string;
  rawText: string;
  said: string[];
  medicines: Medicine[];
  nextSteps: string[];
  followUpDate?: string;
  followUpNote?: string;
  feeling?: Feeling;
  feelingNote?: string;
}

export interface CheckIn {
  id: string;
  kind: "checkin";
  createdAt: string;
  feeling: Feeling;
  note?: string;
}

export type Entry = Episode | Visit | CheckIn;

export interface AppData {
  version: 1;
  profile?: Profile;
  entries: Entry[];
  pin?: { salt: string; hash: string };
}
