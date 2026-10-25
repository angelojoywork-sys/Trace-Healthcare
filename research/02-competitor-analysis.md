# 02 · Competitor analysis

Feature claims come from store listings, help pages and reviews (October 2026). Where a feature wasn't confirmed, it's marked `?`.

## The landscape

| App | What it is | Strengths | Gaps for our user |
|-----|-----------|-----------|-------------------|
| **Ada** | AI symptom checker, EU Class IIa device, 13m+ users | Structured follow-up questions; urgent-symptom warning; PDF report; profiles for others ([Healthify](https://healthify.nz/apps/a/ada-check-your-health), [Fortune](https://fortune.com/2024/01/04/ai-make-business-better-ada-health)) | Not Irish-aware (no GP co-ops, DTSS, PRSI, pharmacy CCS); no visit notes; diagnosis-led framing |
| **Healthily / Symptomate** | Symptom checkers | Quick assessment, triage level | Generic routing; no visit memory; no Irish costs/entitlements |
| **Bearable** | Symptom & mood tracker | Flexible tracking, correlations, filtered export for doctors ([Bearable help](https://bearable.app/support/common-questions/how-to-share-data-with-a-doctor-therapist-or-other-medical-team-member/)) | Export is a CSV, not a "show the doctor" screen ([review](https://www.choosingtherapy.com/bearable-app-review/)); no AI intake; no routing |
| **CareClinic** | All-round health tracker | Symptom diary with **body map**, meds reminders, care-team sharing, reports ([App Store](https://apps.apple.com/app/id1455648231)) | Dense UI; no AI conversation; no Irish routing; no visit summary from speech |
| **Flo / Clue** | Cycle trackers | Women-centred, cycle-aware symptoms, large audience | Cycle-only scope; trust damaged by Flo data case ([FTC](https://www.ftc.gov/system/files/documents/cases/flo%5Fhealth%5Fcomplaint.pdf)) |
| **HSE Health App** | Official national app | Trusted source; medicines list; vaccines; planned appointments/referrals ([eHealth Ireland](https://ehealthireland.ie/technology-and-transformation-functions/digital-for-care-2030/hse-health-app)) | MyGovID barrier; no symptom intake, routing or personal visit notes |
| **HSE.ie / HSE Live** | Web + phone | Authoritative condition pages and entitlements | Static pages; phone hours limited; user must already know what to search |
| **Apple Health / Google Health Connect** | Platform health records | Integrations, medications, cycle | Not conversational; no routing; records only from connected providers |
| **AI scribes (clinician-side)** | Recording tools for doctors | Accurate structured notes | Owned by the clinician, not the patient; not available to her |

## Feature matrix

| Capability | Ada | Bearable | CareClinic | Flo/Clue | HSE App | **Trace (target)** |
|---|---|---|---|---|---|---|
| Conversational AI intake | ✓ | – | – | partial | – | **✓** |
| Tap-to-point body/face map | ? | – | ✓ | – | – | **✓** |
| Ireland-specific "where to go" | – | – | – | – | partial | **✓** |
| Costs & entitlements (GP card, DTSS, PRSI, CCS) | – | – | – | – | – | **✓** |
| Red-flag emergency escalation | ✓ | – | – | – | – | **✓** |
| Visit log by voice → structured summary | – | – | – | – | – | **✓** |
| Follow-up reminder from the summary | – | – | ✓ (manual) | – | – | **✓** |
| "Show my doctor" one-screen view | PDF | CSV | report | – | med list | **✓** |
| Symptom + feeling timeline | partial | ✓ | ✓ | cycle | – | **✓** |
| Cycle-aware (opt-in) | – | ✓ | ✓ | ✓ | – | **✓** |
| Inclusive, anatomy-first profile | ? | ✓ | ? | partial | n/a | **✓** |
| Local-first, no ad trackers | ? | ✓ | ? | contested | ✓ | **✓** |

## The gap

No product joins up the **three moments** of the founding story:

```
BEFORE the visit         AT / AFTER the visit         NEXT visit
"What is this,           "What did they say,          "Here's my story
 where do I go?"          what do I do now?"           so far."
   Ada, HSE.ie              nobody                       Bearable/CareClinic
   (not Irish-aware)        (clinician scribes only)     (exports, not a view)
```

**Positioning:** *Trace is the patient's own memory of their care in Ireland: it helps you describe what's wrong, points you to the right door, and remembers what every doctor said.*

## What to borrow

- Ada's **one question at a time** intake and upfront emergency warning.
- CareClinic's **body map** for "where does it hurt".
- Bearable's **low-effort daily check-in** and filtered sharing.
- HSE App's **trust signals** (official sources, no ads), so cite HSE pages inline.

## What to avoid

- Diagnosis-first copy ("You may have…") that raises device class and anxiety (D24, D26).
- Dense dashboards: 28–40% limited health literacy (D22).
- Any ad SDK or third-party analytics on health events (D27–D28).
