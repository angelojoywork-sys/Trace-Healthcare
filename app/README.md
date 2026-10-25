# Trace MVP (prototype)

A working, mobile-first prototype of the Trace MVP from [`research/06-insights-and-requirements.md`](../research/06-insights-and-requirements.md). It's a static React + TypeScript app, has no backend, and keeps all data in the browser (`localStorage`).

> Not a diagnostic tool. The assistant is **scripted** (rules and templates, no LLM) on purpose: it's predictable and safe, and it can be tested against the research vignettes.

## Run it

```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm test         # routing, recap parser and red-flag unit tests
npm run build    # static build in app/dist
```

## Deploy (Vercel)

`vercel.json` at the repo root builds `app/`, so the project imports with no settings:

1. Go to [vercel.com/new](https://vercel.com/new) and import `angelojoywork-sys/Trace-Healthcare`.
2. Leave every setting at its default and click **Deploy**.
3. Every push to the connected branch redeploys. Other branches get preview URLs.

## What's in it (MoSCoW → screen)

| ID | Requirement | Where |
|----|-------------|-------|
| M1 | Intake, one question at a time, text + voice (Web Speech API, `en-IE`) | `src/screens/Intake.tsx` |
| M2 | Tap-to-point body map: front, back, face/jaw/teeth detail, plus a list alternative | `src/components/BodyMap.tsx` |
| M3 | Red-flag interrupt (checkbox or phrases in free text) → 112/999, nearest ED, Samaritans for self-harm | `src/lib/regions.ts`, `RedFlagScreen` |
| M4 | Ireland routing card: door, urgency, out-of-hours, cost, entitlements, safety net, sources | `src/lib/routing.ts`, `src/screens/Result.tsx` |
| M5 | Visit recap: speak/type → structured summary (clinician, what they said, medicines + dose/frequency/duration, next steps, follow-up) → user edits | `src/lib/recap.ts`, `src/screens/Recap.tsx` |
| M6 | Follow-up reminder: "Coming up" on home + `.ics` calendar file | `src/lib/format.ts` |
| M7 | Show-doctor view: one screen, large type, print/PDF | `src/screens/ShowDoctor.tsx` |
| M8 | Timeline of symptoms, visits, check-ins | `src/screens/Timeline.tsx` |
| M9 | Privacy: on-device only, PIN lock, export JSON, print PDF, delete all | `src/screens/Settings.tsx` |
| M10 | Inclusive profile: name, pronouns, optional entitlements; anatomy asked only when relevant | `ProfileForm.tsx`, Intake `anatomy` step |
| S1 | Questions to ask at the appointment | `Result.tsx` |
| S2 | Daily "How are you feeling?" check-in | `Home.tsx` |

**Example data:** on the welcome screen choose "Explore with example data", or use Privacy → Load example data. Either loads Ana's toothache journey from `research/05-user-journeys.md`.

## Known limits (for usability testing)

- Routing rules are a first draft built from desk research (D-numbers in `routing.ts`). A clinician needs to review them before any real use.
- The surgery-hours check assumes Mon–Fri 9–6 and doesn't know about bank holidays.
- Voice depends on the browser: it works in Chrome and Safari, but not in Firefox.
- The PIN is a soft lock, not encryption.
- Costs are typical published figures (Oct 2026). Users should check when they call.
