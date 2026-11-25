# Process log

Newest first. One entry per working session.

## 2026-11-25 — 05 Low-fi wireframes (v1)
- **What we did:** Built 9 low-fi screens (`design/wireframes-lofi.html`): welcome, about you, body log, zoom, how it feels, summary, entry detail, find GP, browse/search.
- **Why:** Check the flow before hi-fi. MVP goes to testers today.
- **Decisions:** Country = Ireland. Nav = Summary / Find GP / Browse (from Apple Health). Share lives inside the entry. "How it feels" slider after picking a symptom (Apple Health mood UI). Welcome screen modelled on Ada, with skip. Overview = Summary tab.
- **References:** Ada (welcome), Apple Health (nav, mood slider), Bearable-style insight cards.
- **Tools used / where AI helped (and what a human verified):** Claude built wireframes in HTML; human to review flow.
- **Artifacts saved in:** `design/wireframes-lofi.html`

## 2026-11-25 — 04 User flow (draft v1)
- **What we did:** Drafted a 5-screen happy path: sign in, profile, hologram body log, home (Log / Find GP tabs + search), entry detail (date, GP, notes, photo).
- **Why:** User wants a 1-tap log via a hologram body that zooms to body areas.
- **Decisions:** Log before login if possible; ask location only at Find GP; build hologram look in 2D first (tap accuracy risk in 3D); Find GP v1 = nearby clinics, not symptom-matched; add "what the GP said" notes field.
- **Open:** Country (decides GP data source and insurance export). Mobbin search blocked (paid plan), inspiration to be gathered manually.
- **Tools used / where AI helped (and what a human verified):** Claude drafted flow; human to verify with 3-5 user chats.
- **Artifacts saved in:** `design/` (next: flow diagram)

## 2026-11-25 — 02 Problem framing (restart)
- **What we did:** Restarted from step 1. Captured the origin story and drafted problem statement, core features, happy paths, and a stress test (all assumptions, not yet validated).
- **Why:** Idea came from one person (partner seeing multiple GPs, forgetting symptoms, what each GP said, and prescriptions needed for insurance claims).
- **What we learned:** Evidence is n=1. Need primary research before design. Core objects: Symptom entry, Visit, Document (prescription/receipt). Product = a searchable timeline.
- **Tools used / where AI helped (and what a human verified):** Claude drafted the framing; human to verify with real users.
- **Artifacts saved in:** `research/` (next: interview guide)

## YYYY-MM-DD — <step, e.g. 01 Research>
- **What we did:**
- **Why:**
- **What we learned:**
- **Tools used / where AI helped (and what a human verified):**
- **Artifacts saved in:** `<folder>`
