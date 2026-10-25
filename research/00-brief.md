# 00 · Project brief

**Project:** Trace (working name, see [08-naming.md](08-naming.md))
**Phase:** 1, Discovery & research
**Method:** Desk research only (secondary sources + the founding story). No live participants yet, so personas are *proto-personas* and every claim is either cited or tagged `[assumption]`.
**Date:** October 2026 · **Location:** Ireland

---

## Origin story

> My girlfriend had a toothache that wasn't going away. She didn't know what it was, whether she should see a GP or a dentist, what it would cost, or who was even open. And once she did see someone, there was nothing to help her remember what they'd said for next time.

That single episode contains the whole problem space:

1. **"What is this?"** Pain in the face/jaw is hard to place. A toothache can be a tooth, a sinus, an ear, the jaw joint, or a headache disorder, and clinicians themselves find it hard to tell apart ([HSE GP guidance on atraumatic dental pain](https://assets.hse.ie/media/documents/Advice_for_general_medical_practitioners_on_the_management_of_atraumatic_dental_pain.pdf); [Headache review, PubMed 31675112](https://pubmed.ncbi.nlm.nih.gov/31675112/)).
2. **"Who do I go to?"** In Ireland the answer depends on age, medical card, PRSI record, time of day and county.
3. **"What did they say?"** Patients forget 40–80% of what a clinician tells them, and about half of what they do remember is wrong ([Kessels 2003, J R Soc Med](https://pmc.ncbi.nlm.nih.gov/articles/PMC539473/)).
4. **"Show the next doctor."** Each new clinician starts from zero unless the patient carries the story.

## Problem statement

People in Ireland, and women especially, who notice a new or lingering symptom have no single, trustworthy place that helps them **describe it**, **work out where to go** inside the Irish system, and **keep a clear record** of what each clinician said, so they can show it at the next appointment. The result is delay, wasted visits and money, and the feeling of not being taken seriously.

## Audience

- **Primary:** women aged roughly 20–45 living in Ireland, including people new to the Irish system.
- **Inclusive by design:** men, trans and non-binary people. "Women-first" shapes priorities (cycle-aware symptoms, pain dismissal, women's health schemes), never gates access. Anatomy and language stay neutral by default.

## Goals for the MVP

| # | Goal | The user can… |
|---|------|----------------|
| G1 | Describe | tell a live AI assistant what's wrong by voice, text, or by tapping a point on a body/face map; the assistant asks structured follow-ups. |
| G2 | Route | see where to go *in Ireland* (pharmacy, GP, dentist, out-of-hours co-op, injury unit, ED, 112/999), roughly what it costs, and what she's entitled to, from HSE/public sources. |
| G3 | Remember | after a visit, speak or type what happened and get a structured summary: symptoms, what the clinician said, medicines, next steps, follow-up date, how she's feeling. |
| G4 | Show | open a one-screen "show my doctor" view in seconds at the next appointment. |
| G5 | Track | see a timeline of symptoms, visits and how she's been feeling. |

## Out of scope (MVP)

Diagnosis, prescribing, booking integration with practice systems, HSE record integration, insurance claims, telemedicine calls with clinicians.

## Research questions

1. How do people in Ireland decide where to go for a new symptom, and where does that break down?
2. What do people forget or lose after an appointment, and what would they want to keep?
3. What makes a health AI feel trustworthy, and what makes it feel dangerous?
4. What extra friction do women, trans and non-binary people meet when describing pain?
5. What do existing apps do well, and what gap is left?
6. What regulatory and safety lines must the product not cross?

## Constraints and ethical flags

- **Not a diagnostic device.** Software that gives information used for diagnostic decisions is generally MDR Class IIa, and AI inside such a device is likely high-risk under the EU AI Act ([Reed Smith](https://reedsmith.com/our-insights/blogs/viewpoints/102kq35/the-eu-ai-act-and-medical-devices-navigating-high-risk-compliance); [Portolano](https://portolano.it/en/blog/life-sciences/ai-act-impact-medical-device-industry)). Ada, for comparison, is certified Class IIa ([Healthify NZ](https://healthify.nz/apps/a/ada-check-your-health)). The MVP positions the AI as *navigation and note-taking*, never "you have X". Intended purpose and marketing wording decide the class, so copy matters. `[needs legal review before launch]`
- **Red flags always win.** Any emergency sign (facial swelling spreading, difficulty breathing/swallowing, chest pain, stroke signs, heavy bleeding, suicidal thoughts) interrupts everything with 112/999 and the nearest ED. HSE guidance itself says facial or intra-oral swelling needs an urgent dental opinion.
- **Health data is special-category data under GDPR.** Local-first storage, explicit consent, no ad trackers, easy export and delete. Trust in women's health apps has been damaged by the Flo case ([FTC complaint](https://www.ftc.gov/system/files/documents/cases/flo%5Fhealth%5Fcomplaint.pdf)).
- **Recording clinicians.** Voice capture is for the *user's own* recap after the visit by default. Recording during a consultation requires asking the clinician. `[assumption, legal check needed]`

## Success criteria for this phase

- A cited evidence base on the Irish pathway, women's health context, recall, AI trust and inclusion.
- Competitor gap clearly stated.
- Proto-personas, an affinity map, current and future journeys, and a prioritised MVP list that all trace back to evidence.
- A ready-to-run interview guide and survey for the validation round.
