# Trace: project timeline (draft v1)

Built from the git history (57 commits on `main`), `process-log.md` (46 dated entries) and the titles of your earlier Claude sessions. I did not read the session transcripts, so anything marked *(inferred)* comes from session titles and dates only. Draft for the case study. Not yet checked by a human.

Live app: https://trace-health-ie.vercel.app/ · Repo: https://github.com/angelojoywork-sys/Trace-Healthcare

## 1. The story in one paragraph

Trace began as a health companion for Ireland: describe a symptom, find the right door in the health system, remember what each doctor said. After a first prototype and a research phase, the project restarted on 24 to 25 November 2026 with a clearer idea: a private symptom and visit log, built around a 3D body you tap to say where it hurts. In about one day it went from problem framing to a live, measured app with a feedback card.

## 2. Phases

| When | Phase (taste.md step) | What happened |
|---|---|---|
| 25 Oct | 1 Research, first prototype | Research brief, 30 desk-research findings, competitor analysis, personas, affinity map, journeys, requirements. A scripted-assistant MVP prototype was built and merged (PR #1). |
| 24 Nov | Process set-up | `taste.md` (the working process), `process-log.md` and rules in `CLAUDE.md` added (PR #2). |
| 25 Nov | 2 Problem framing (restart) | Restarted from step 1. The idea came from one person's experience (n=1), so primary research is still needed. Core objects: symptom entry, visit, document. |
| 25 Nov | 4 User flow, 5 Wireframes | User flow draft, then low-fi wireframes v1, v2, v3 with five flows. Design system v1, v2 (HUD direction), v3. |
| 25 Nov | Tooling | Tailwind v4 and shadcn/ui set up with a MUI-based colour palette and Trace tokens. |
| 25 Nov | 6 Hi-fi build | 3D hologram body (Anny mesh), note and severity screens, name and gender screen, welcome screen, Summary, Entry detail, Browse and search, Find GP (524 OpenStreetMap practices), Share visit as PDF, delete with undo. |
| 25 Nov | 6 Deploy | Vercel first deploy failed, then fixed. Feedback card, tester note and PostHog analytics added. |
| 25 Nov | Design rounds | Feedback round 1 (copy, 1 to 10 severity, floating nav, location help). Mist light theme, liquid glass (three iterations), favicon (five log entries). |
| 25 Nov | Clean-up | Duplicate analytics reverted (PR #4), live app merged into `main` (PR #5), privacy wording fixed, Vercel Production Branch set to `main`, log updated (PR #6). |

## 3. What was built (all on `main`)

Hologram body (female, male, neutral) · name and gender onboarding · welcome screen with 3D DNA mark · severity 1 to 10 · Summary · Entry detail (GP, visit date, what the GP said, prescription photos) · Browse with search · Find GP (location sort, call, directions) · Share visit PDF · delete with 10-second undo · in-app feedback card · `?reset` link · PostHog analytics.

## 4. Tools and methods used (from the log and git)

- **Design/build:** Tailwind v4, shadcn/ui (Base UI flavour), MUI palette values, Geist fonts, three.js with the Anny body mesh.
- **Data:** OpenStreetMap GP data (via a converter script), `data.gov.ie`, `overpass-api.de`.
- **Hosting and measurement:** Vercel (auto-deploy from `main`), PostHog EU for events and feedback.
- **Testing:** headless Playwright checks, Vitest unit tests (9 tests on the old prototype).
- **AI use:** Claude drafted, built and ran checks. The log marks where a human still had to verify. Where AI vs human decided is not recorded consistently. This is a gap to fix.

## 5. Things that failed or changed course

- **First Vercel build failed** (`cd app: No such file or directory`). The fix was to set the Production Branch to the feature branch, because redeploying the failed `main` build would have repeated the failure.
- **Domain rename failed:** `trace-health.vercel.app` was taken, so the live name is `trace-health-ie.vercel.app`.
- **Favicon: about fifteen explorations** (dotted hearts, network lines, a helix, a person, a T mark). The user chose to return to the DNA heart. A rebuilt "cleaner" version was rejected in favour of the earlier one.
- **DNA heart rebuild:** four approaches failed (thin strands chopped, narrowed twists folded, beaded runs looked broken, strands bunched at the corners).
- **Severity visual:** the letter helix was replaced by a dot field, then a ball of squares.
- **Visual style moved several times:** dark HUD, Mist light theme, liquid glass (three iterations), the pastel wash removed.
- **Duplicate analytics:** I built analytics and a feedback prompt on `main` that already existed on another branch. They were reverted.
- **Privacy claim was wrong:** "no trackers" stayed in the app after PostHog was added. Now reworded.
- **Shadcn CLI:** blocked by the cloud network (fixed with a personal environment) and generated a wrong import (`cn`).

## 6. Lessons

1. Work on an unmerged branch is invisible to a new session. Merge to `main` and log it.
2. Check every branch (`git branch -r`) before saying something isn't built.
3. A privacy claim must match what the code sends.
4. Agree one direction before building variations (favicon).
5. Test an icon at 16 px early. Detail has to survive the smallest size.
6. Change one thing at a time and keep the chosen option.
7. Evidence is n=1, so primary research must come before more design.

## 7. Your earlier sessions (inferred from titles and dates, transcripts not read)

- 25 Oct: "Git connection", "Women's health symptom tracking app", "Plan implementation" (MVP prototype merged to `main`).
- 24 Nov: "shadcn overview", "Taste and process documentation", "Session recap".
- 25 Nov: "Starting over step by step" (the main build), "Latest version link" (feedback round 1), "Vercel app link" (this session).
- Other sessions in your account appear to cover different projects (a gym app, a portfolio, motion and Blender work). I have not linked them to Trace.

## 8. Not yet known

- Which parts a human decided versus AI (to record from now on).
- The failures and discussions that were only in chat. Reading the session transcripts could recover some of them.
- Results: usage and feedback. PostHog showed 11 app opens and 1 symptom saved on 25 Nov, and no feedback events yet. No usability tests have run.
- Whether "makerhuman" refers to something specific. Tell me what you meant.

## 9. Decisions to revisit (from the log)

- Removing the Find GP partial-list notice means the app no longer says its list covers only about a fifth of practices. The tester note still says it.
- Removing the speech-service line removed the only in-app mention that voice goes to the browser vendor. For a health app, consider restoring it.
- `research/06` still lists "no trackers" as a principle.
