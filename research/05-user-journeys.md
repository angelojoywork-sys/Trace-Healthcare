# 05 · User journeys

Persona: **Ana** ([03-proto-personas.md](03-proto-personas.md)). Scenario: lingering toothache, the founding story.
Emotion scale: 😣 −2 · 😟 −1 · 😐 0 · 🙂 +1 · 😌 +2

---

## A · Current state (today, without Trace)

| Stage | 1 · Notice | 2 · Search | 3 · Decide | 4 · Visit | 5 · After | 6 · It comes back |
|---|---|---|---|---|---|---|
| **Doing** | Dull ache in a molar for days; throbbing at night, reaching her ear | Googles "tooth pain ear"; reads NHS and US pages; partner searches too | Tries GP; list closed. Rings a dentist; next slot is Thursday. Considers ED | Dentist: possible infection, X-ray, antibiotics, painkillers, "come back in 2 weeks if not settled" | Walks out, tells partner half of it; loses the leaflet | Three weeks later it aches again. New dentist asks what happened before |
| **Thinking** | "Probably nothing." | "Is it my ear? My sinus? Is this an emergency?" | "Am I paying €60 to be told to see someone else?" | "I'll remember this." | "Was it 3 times a day or 2? When do I go back?" | "I don't remember the name of the antibiotic." |
| **Feeling** | 😐 | 😟 | 😣 | 😟 | 😟 | 😣 |
| **Pain points** | No easy way to log onset | Generic, non-Irish info (D22) | Wrong door, closed lists, cost, no OOH dental (D1, D6, D10, D13) | Anxiety, information overload (D20) | Forgets 40–80% (D20) | Starts from zero; not believed (S6, D15) |
| **Opportunity** | One-tap "start tracking" | Guided intake + face map | Irish routing with costs & entitlements | Pre-visit question list | Voice recap → summary + reminder | Show-doctor view |

```
Emotion  +2 ┤
         +1 ┤
          0 ┤ ●
         −1 ┤      ●              ●      ●
         −2 ┤            ●                       ●
            └──Notice─Search─Decide─Visit──After──Returns
```

---

## B · Future state (with Trace)

| Stage | 1 · Notice | 2 · Describe | 3 · Route | 4 · Visit | 5 · Recap | 6 · Next time |
|---|---|---|---|---|---|---|
| **Doing** | Opens Trace → "Something's wrong" | Taps lower-right jaw on face map; answers questions by voice: how long, what makes it worse, swelling? fever? | Trace: "This sounds like a dentist, not a GP. No red flags. Book within 1–2 days." Shows PRSI free check-up, typical cost, two nearby dentists, what to do if face swells | Opens "Questions to ask" Trace prepared | Leaves, taps mic: "She said possible abscess, amoxicillin 500 three times a day for 7 days, X-ray next week, come back if swelling." Trace makes the summary and sets a reminder. "How are you feeling?" → 😟 sore, relieved | Opens the show-doctor view: timeline, previous dentist's summary, medicine, how she's felt |
| **Thinking** | "Let me just note this." | "It's asking the questions I wouldn't think of." | "OK, dentist, tomorrow, and it might be free." | "I've got my list." | "Done. I don't need to remember." | "Here, it's all there." |
| **Feeling** | 😐 | 🙂 | 😌 | 🙂 | 😌 | 😌 |
| **Trace feature** | Quick log | AI intake + body map | Ireland routing + costs + red flags | Pre-visit prep | Voice→summary, follow-up reminder, feeling check | Show-doctor view, timeline |
| **Evidence** | S4 | D1, D2, D22 | D1–D10, D13 | D20 | D20, D21 | D15–D17 |

```
Emotion  +2 ┤                   ●            ●       ●
         +1 ┤         ●                ●
          0 ┤ ●
         −1 ┤
         −2 ┤
            └──Notice─Describe─Route──Visit──Recap──Next
```

---

## C · Red-flag branch (safety path)

```
Intake ──► any red flag? ──yes──► STOP. Full-screen: "Call 112/999 or go to ED now"
   │       (spreading facial           + nearest ED + one-tap call
   │        swelling, trouble          + "I've called / I'm safe" to resume later
   │        breathing/swallowing,
   │        high fever with swelling,
   │        chest pain, stroke signs)
   │
   no
   ▼
Routing ──► out of hours? ──yes──► GP co-op / Dublin Dental Hospital line / ED by region (D6, D7)
   │
   no
   ▼
Normal routing (pharmacy CCS · GP · dentist · injury unit)
```

## D · Secondary journeys (summary)

- **Siobhán · Prepare for an appointment:** opens timeline → Trace highlights pattern ("pain worst days 1–3 of cycle, 14 episodes since March") → generates 3 questions → show-doctor view in the appointment.
- **Rory · Pharmacy-first:** describes burning on urination with anatomy-first questions → Trace says uncomplicated UTI can be treated by a participating pharmacist (D8), lists nearby pharmacies → logs pharmacist's advice by text.
