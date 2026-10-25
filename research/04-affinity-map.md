# 04 · Affinity map

**Method:** Each finding from the desk research (D-IDs) and the founding story (S-IDs) was written as one atomic note, then grouped bottom-up into clusters, then named. The visual version is in [visuals/research-board.html](visuals/research-board.html).

Founding-story notes:
- **S1** Didn't know what the pain was.
- **S2** Didn't know if GP or dentist.
- **S3** Didn't know what it would cost.
- **S4** Pain kept coming back; no record of the first time.
- **S5** Partner was researching for her and also didn't know.
- **S6** Wanted a quick thing to show the next doctor.

---

## Cluster 1 · "Which door do I knock on?"
*Uncertainty about where to go.*

| Note | Source |
|------|--------|
| Toothache is hard to place, even for clinicians | D1, D2, S1 |
| GP isn't the fix for dental pain; dentist is | D1, S2 |
| Right door depends on age, card, PRSI, time, county | D3, D4, D7 |
| Pharmacists can now treat 8 common conditions; few know | D8 |
| Out-of-hours dental barely exists outside Dublin | D6 |
| GP lists closed for new patients | D13 |

**HMW** help someone find the right door in Ireland in under two minutes, without knowing the system?

## Cluster 2 · "What will this cost me?"
*Money shapes behaviour.*

| Note | Source |
|------|--------|
| GP visit €40–€80 | D10 |
| Charges deter people from going | D11 |
| 70% miss the free PRSI dental check-up | D5 |
| Free contraception 17–35 incl. GP visit | D19 |
| Worried about paying for the wrong appointment | S3 |

**HMW** show likely cost and entitlements at the moment of decision?

## Cluster 3 · "I forgot what they said"
*Memory loss after appointments.*

| Note | Source |
|------|--------|
| 40–80% forgotten immediately; half of the rest wrong | D20 |
| Recordings improve recall and trust | D21 |
| HSE recommends a medicines list | D23 |
| No record of the first episode | S4 |

**HMW** turn a messy two-minute voice note into a summary she can rely on?

## Cluster 4 · "They didn't believe me"
*Pain dismissal and long roads to diagnosis.*

| Note | Source |
|------|--------|
| Women get less analgesia for the same pain score | D15, D16 |
| Endometriosis takes 7–10 years to diagnose | D17 |
| Each new clinician starts from zero | S6, persona 2 |

**HMW** give people a record of their own words that makes them easier to believe?

## Cluster 5 · "Can I trust an AI with this?"
*Accuracy, safety, regulation.*

| Note | Source |
|------|--------|
| Diagnosis first only 34% of the time | D24 |
| Triage is risk-averse; over-sends | D24 |
| Getting better, still a complement | D25 |
| Intended purpose drives device class | D26 |
| Must escalate red flags immediately | D1, brief |

**HMW** make the AI helpful and honest about its limits without causing panic or false calm?

## Cluster 6 · "Who sees my data?"
*Privacy as the price of entry.*

| Note | Source |
|------|--------|
| Flo shared health data despite promises | D27 |
| Transparency and security beat cost and ease | D28 |
| HSE App trusted but MyGovID barrier | D14 |

**HMW** prove privacy in the interface, not just the policy?

## Cluster 7 · "Ask about my body, not my gender"
*Inclusion.*

| Note | Source |
|------|--------|
| Trans people report mistreatment in healthcare | D29 |
| Negative GP experiences being studied | D30 |
| Free contraception open to trans/non-binary people | D19 |
| Women-heavy conditions in pharmacy scheme | D8 |

**HMW** be women-first in content while welcoming every body?

## Cluster 8 · "Make it easy when I'm in pain"
*Low capacity in the moment.*

| Note | Source |
|------|--------|
| 28–40% limited health literacy | D22 |
| Most difficulty is finding & evaluating info | D22 |
| Anxiety worsens recall | D20 |
| Using phone one-handed, at night, in pain | persona 1 `[assumption]` |
| Partner helping on her behalf | S5 |

**HMW** design for someone in pain, tired and anxious, using one hand?

---

## Cluster relationships

```
             ┌─────────── 5 Trust in AI ───────────┐
             │                                     │
 8 Low capacity ──► 1 Which door? ──► 2 Cost    6 Privacy
             │            │
             │            ▼
             └──► 3 Forgot what they said ──► 4 Not believed
                                    ▲
                     7 Inclusion ───┘ (applies across all)
```

Clusters **1 → 3 → 4** are the spine of the product: *route → remember → be believed*. 5, 6, 7 and 8 are qualities every screen must have.
