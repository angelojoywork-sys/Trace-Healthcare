# 06 · Insights, principles and MVP requirements

## Key insights

| # | Insight | Evidence | Cluster |
|---|---------|----------|---------|
| I1 | **The hardest question isn't "what is it?" but "where do I go?"** In Ireland that answer depends on symptom, entitlements, time and county. | D1–D9, D13, S2 | 1 |
| I2 | **Cost is a decision-maker, and entitlements are invisible.** People skip care they could get free. | D5, D10, D11, D19 | 2 |
| I3 | **Most of a consultation is lost by the time you reach the car.** A recap captured in the moment is worth more than a perfect note later. | D20, D21 | 3 |
| I4 | **Your own timeline is evidence.** For women whose pain is under-treated, a dated record in their own words helps them be believed. | D15–D17, S6 | 4 |
| I5 | **AI earns trust by asking, not diagnosing.** Good questions + honest limits + fast red-flag escalation. | D24–D26 | 5 |
| I6 | **Privacy must be visible.** Users choose health apps on transparency over cost or ease. | D27, D28 | 6 |
| I7 | **Anatomy-first is inclusive by default.** Ask about bodies when relevant; never gate on gender. | D29, D30 | 7 |
| I8 | **Design for someone in pain at 11pm.** One hand, low literacy, high anxiety. | D20, D22 | 8 |

## Design principles

1. **Ask, don't tell.** The AI interviews; it never names a diagnosis.
2. **Point to a real door.** Every conversation ends with a concrete Irish next step, cost and source link.
3. **Safety interrupts everything.** Red flags take over the screen instantly.
4. **Capture now, tidy later.** Voice in, structured summary out; user confirms.
5. **One screen for the doctor.** Readable across a desk in 10 seconds.
6. **Private by default, visibly.** Local-first, no trackers, clear lock and export/delete.
7. **Calm, plain, kind.** Plain English (NALA Crystal Clear style), large targets, no blame.
8. **Every body.** Neutral map and language; women's health content surfaced, not imposed.

## MVP feature list (MoSCoW)

### Must
| ID | Feature | Insight |
|----|---------|---------|
| M1 | **AI symptom intake** (text + voice), one question at a time: where, when, how bad (0–10), what helps/worsens, associated symptoms | I5, I8 |
| M2 | **Tap-to-point body map** (front/back + face/jaw/mouth detail), neutral silhouette | I1, I7 |
| M3 | **Red-flag interrupt** → 112/999, nearest ED | I5 |
| M4 | **Ireland routing card**: recommended door (pharmacy / GP / dentist / GP co-op / injury unit / ED), urgency window, typical cost, entitlement hints (medical card, GP visit card, PRSI dental, free contraception, pharmacy CCS), HSE source link | I1, I2 |
| M5 | **Visit recap**: speak or type → structured summary (symptoms, what clinician said, medicines + dose, next steps, follow-up date, how I'm feeling); user edits and confirms | I3 |
| M6 | **Follow-up reminder** from the recap | I3 |
| M7 | **Show-doctor view**: one screen, large type, current issue, timeline, meds, last advice | I4 |
| M8 | **Timeline** of symptoms, visits and feelings | I4 |
| M9 | **Privacy basics**: on-device storage, Face ID/PIN lock, export PDF, delete all | I6 |
| M10 | **Inclusive profile**: name, pronouns, optional anatomy questions | I7 |

### Should
- S1 "Prepare for my appointment": generated question list from the timeline.
- S2 Daily 5-second "How are you feeling?" check-in.
- S3 Nearby services list (opening hours, phone, map link) for GP co-ops, injury units, pharmacies.
- S4 Log for someone else (partner/child).
- S5 Opt-in cycle context for pattern spotting.

### Could
- C1 Pattern insights ("worse on days 1–3 of cycle").
- C2 Share a time-limited link of the show-doctor view.
- C3 Irish-language UI.
- C4 Consented in-consultation recording.

### Won't (MVP)
- Diagnosis or condition probabilities. Booking integration. HSE record sync. Telehealth.

## Success metrics (for later testing)

- Time to a routing answer < 2 min (task timing).
- ≥ 80% of test users pick the correct door for 5 vignettes with Trace vs baseline Google.
- Recap accuracy: ≥ 90% of key items (meds, dose, follow-up) captured from a scripted voice note.
- Show-doctor view: clinician can state the issue, duration and current meds in ≤ 15 s.
- SUS ≥ 75; trust score ≥ 4/5 on "I'd use this for my health".

## Open questions (for validation)

1. Do people want the AI to *talk* (voice reply) or only listen?
2. Is it acceptable to record the clinician, or only the user's own recap?
3. How much location do people share for "nearby"?
4. Would GPs/dentists welcome the show-doctor view? (Ask 2–3 clinicians.)
5. What's the minimum medical-device-safe wording for routing?
