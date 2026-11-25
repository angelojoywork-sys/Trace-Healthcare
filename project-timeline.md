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

## 10. From the transcript "Starting over step by step"

Read: all of your own typed messages in that session (about 85 in total, tool output excluded), 25 Nov 2026, 00:07 to 18:34 UTC. Two agents read it in two parts and I spot-checked the quotes in the earlier part against the saved messages. Short quotes are as written. Gaps: there are no messages from you between 00:20 and 10:53 UTC, so what happened in that window comes only from the log and git, and I can't confirm the "wireframes v1 to v3" numbering from your messages.

### 10a. 00:07 to 15:58 UTC

| Time (UTC) | What you said or decided |
|---|---|
| 00:07 | "start over on this, step by step, simple process" |
| 00:20 | The origin story: a partner saw several GPs and forgot what each said and what the symptoms were. You wanted a symptom log, prescription photos for insurance claims, and a history over months. You asked to stress-test the idea from every angle. |
| 10:53 | The user flow: login or guest, name, location, gender. A rotating body hologram that zooms to a tapped spot and opens a note pop-up. A main screen with the log and Find GP. An entry with date, GP, what the GP said and the prescription. |
| 11:04 | Country is Ireland. "I ran the user interviews already - dont push me on that now". The MVP goes to testers the same day and the case study is posted that evening. You asked for sketches or low-fi wireframes before hi-fi, and for App Store screengrabs as reference. |
| 11:32 to 11:51 | Wireframe revisions (hologram only on the body screen, a "how bad is it" screen, bottom icon nav, voice in the note, copy changes). You supplied a futuristic style reference. You asked for the design and UI principles to go into `taste.md`. |
| 12:01 to 12:11 | Decisions: guest session, "Other" gender option, keep "List view", "The 3D should not fail." You asked how to set up shadcn and MUI. You chose to skip Figma for now. You asked about Netlify and Supabase for deploy, and Vercel was used. |
| 12:23 to 13:02 | Hologram build: "Please dont move to any other screens until we perfect the hologram". Three bodies (female, male, neutral), teal glow, a smooth full body. You asked about MakeHuman bodies and a free model, and whether it costs money. At 13:02: "deploy it to Vercel so I can test on my phone". |
| 13:10 to 13:27 | First deploy failed (`cd app && npm ci`: no such file). Cause: Root Directory set to `app`. Fixed by clearing it, switching the framework preset to Other and Node to 22.x. Live on a first Vercel address. |
| 13:29 | Body switching by gender wasn't working for you. |
| 13:32 to 14:43 | Screens built in this order: Welcome, Summary, Entry detail, Browse, Find GP, share pack, delete, feedback prompt and tester note. You asked for a DNA illustration on the first screen and noise that grows with severity. |
| 15:48 | A large batch of design feedback (see 10b), which became "Feedback round 1". |

### 10b. Corrections, rejections and rules (all times UTC)

- 11:04 "dont push me on that now" (about user interviews).
- 11:32 "make sure the design principles and ui principles are followed, add that to the tastemd. i know this is a wireframe but its important."
- 12:06 "The 3D should not fail."
- 12:23 "Please dont move to any other screens until we perfect the hologram", and "a bunch of shapes, thats not professional".
- 12:59 "can you not get a clean figures from makehuman yourself".
- 13:29 "I was not able to switch people bodies."
- 14:48 "it should not have a form so rigid like that".
- 14:57 "Why can't I see the first Google login and all those things?"
- 15:09 "whats that box around this?" (led to the box fix around the 3D canvases).
- 15:48 "not a 100% sold" on the colours; asked for a lighter, calmer background; "remove x and y coordinates", "remove the copy - partial list and all that stuff", "dont promote hse find a gp", "whats with the copy - saved,noted,take care".
- 16:49 to 16:50 "who asked you to add the colors?" and "dont act without my approval".
- 18:05 "why is this all turning out to be so shit" (favicon).

### 10c. Decisions that were yours

Ireland as the market; guest session with no email sign-in; gender options including "Other" and "Prefer not to say"; three bodies with a teal glow; the build order (Summary, Entry detail, Browse, Find GP, then share pack, delete, feedback prompt and tester note); skip Figma for now; floating bottom nav, 1 to 10 severity and a lighter background; return to the DNA heart favicon; the domain name `trace-health-ie`.

### 10d. Tools and connectors your messages mention

shadcn and MUI (colours), Figma (skipped), Netlify and Supabase (asked about), Vercel (used), Blender (asked about), a free body model and MakeHuman (the body was built from a ready-made mesh), Chrome and the desktop app to inspect Vercel, and an HSE API and GP data files (asked how to get them). Your messages in this session don't mention Mobbin, Miro, PostHog or Playwright. PostHog and Playwright appear in the log and git, so they were used.

### 10e. Late session (15:58 to 18:34 UTC, read earlier)

- Liquid glass took several tries: you rejected the first attempt ("this is not liquid glass effect"), then picked "version 6". You asked twice for a true circle for the severity ball.
- The Mist theme came from disliking "that particular animated tiny circles".
- "The location is not enabled, the user should be able to enable it" led to the location help.
- "when i reload it doesnt reset to the welcome page" led to the welcome screen on every load.
- The rename to `trace-health` failed. You chose `trace-health-ie`.
- The favicon took about 30 messages between 17:01 and 18:33 and ended with a return to the earlier DNA heart.
- You asked for "the latest link" at least five times.

### 10f. Evidence problem to resolve before the case study

At 11:04 you said you had already run user interviews. The log (`02 Problem framing`) says evidence is n=1 and primary research is still needed, and `research/` has an interview guide but no interview notes. For the case study, every claim needs data. Add the interview dates, sample size and notes, or describe the research as desk research only.
