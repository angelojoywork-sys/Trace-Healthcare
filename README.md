# Trace

A human-centred health companion for people in Ireland, designed women-first and for every body. Trace helps you **describe** a symptom to an AI assistant (voice, text or a tap on a body map), **find the right door** in the Irish health system (pharmacy, GP, dentist, out-of-hours, injury unit, ED) using HSE public information, and **remember** every visit: speak a recap after an appointment and get a structured summary to show the next doctor.

Born from a toothache that wouldn't go away, and nobody knowing who to call.

## Case study progress

| Phase | Status | Where |
|-------|--------|-------|
| 1 · Research | ✅ Desk research done (validation instruments ready) | [`research/`](research/) |
| 4 · Prototype (MVP built first) | ✅ Working, deployable MVP | [`app/`](app/) · [screenshots](design/03-prototype/screenshots/) |
| 2 · Sketching | ⏳ Retro-documented for the case study | `design/01-sketches/` |
| 3 · Wireframes | ⏳ Retro-documented for the case study | `design/02-wireframes/` |
| 5 · Usability testing | ⏳ | `research/09-usability/` |
| 6 · Case study write-up | ⏳ | angelo-portfolio |

## Run the MVP

```bash
cd app && npm install && npm run dev
```

Deploy: import the repo at [vercel.com/new](https://vercel.com/new) and leave the defaults (the root `vercel.json` builds `app/`). Details are in [`app/README.md`](app/README.md).

## Research index

0. [Brief](research/00-brief.md): origin story, problem, goals, scope, ethics
1. [Desk research](research/01-desk-research.md): 30 cited findings (D1–D30)
2. [Competitor analysis](research/02-competitor-analysis.md): Ada, Bearable, CareClinic, Flo, HSE App…
3. [Proto-personas](research/03-proto-personas.md): Ana, Siobhán, Rory
4. [Affinity map](research/04-affinity-map.md): 8 clusters with How-Might-We's
5. [User journeys](research/05-user-journeys.md): current vs future, red-flag branch
6. [Insights & MVP requirements](research/06-insights-and-requirements.md): principles, MoSCoW, metrics
7. [Research instruments](research/07-research-instruments.md): interview guide, survey, usability plan
8. [Naming](research/08-naming.md)

Visual research board: [`research/visuals/research-board.html`](research/visuals/research-board.html)

> Trace is not a diagnostic tool and does not replace a clinician. In an emergency call 112 or 999.
