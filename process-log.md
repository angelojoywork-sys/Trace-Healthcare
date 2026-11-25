# Process log

Newest first. One entry per working session.

## 2026-11-25 — 05d Tooling: shadcn + MUI palette
- **What we did:** Switched the design system to MUI palette values (grey 900/600/500/100, teal A200, green/amber/deep-orange 300). Set up Tailwind v4 + shadcn/ui (Base UI flavour) in `app/` with Trace tokens in `src/globals.css` (dark only, 2px radius, Geist + Geist Mono). Added button, input, textarea, label, toggle-group, slider, drawer, card. Preview at `/?kit`.
- **Why:** Decide the component foundation before hi-fi so the design and the build share one set of tokens.
- **Decisions:** MUI is a colour source only (no MUI components). shadcn "accent" is a hover surface, so our teal lives in `--highlight` and `--ring`. `--border` (grey 600, 3.5:1) for controls, `--line` (grey 800) for decorative frames. Gender gains "Other". Keep "List view" on the hologram screen. Guest mode confirmed ("Log symptom").
- **Learnings:** The shadcn CLI needs ui.shadcn.com, blocked in the default cloud environment, so a personal environment `trace-healthcare` was created that allows it. The CLI generated `import ... from "cn"` (wrong package); replaced with clsx + tailwind-merge.
- **Open:** Slider thumb is 12px (below the 44px target rule) and needs a custom style in hi-fi. Old screens in `app/src/screens` are from the earlier attempt and still use `styles.css`.
- **Tools used / where AI helped (and what a human verified):** Claude ran the setup and a Playwright screenshot of the kit; human to review look.
- **Artifacts saved in:** `app/src/globals.css`, `app/src/Kit.tsx`, `design/design-system.html`

## 2026-11-25 — 05c Wireframes v3 (flows) + design system v2
- **What we did:** Polished wireframes into 5 user flows (A first log, B guest quick log, C after the GP visit, D it happened again, E find a GP) built from 14 screens. Restyled the design system to a dark "HUD" direction from two references (Matteron: bracket frames, counters, mono labels, teal glow; Archetype: info panel with X/Y and label/value rows). Archived v1/v2 wireframes and v1 design system in `design/archive/`.
- **Why:** User feedback: simplify copy, adopt the modern futuristic look, use the Archetype panel for the note pop-up, and test how the flow works across several paths.
- **Decisions:** "Log symptom" replaces email sign-in (guest mode, data on device until backed up with Google). Name + gender only, no explanation text. Hologram heading "Tap to log". Note button reads "Almost there". Note pop-up = X/Y, Area, When, Note + mic. Single dark theme, near-square corners, mono caps labels, teal for attention only. Contrast re-checked (WCAG AA).
- **Open:** Is guest-only (no email sign-in) right? Add "Other" to gender? Keep or drop "List view" on the hologram screen?
- **Tools used / where AI helped (and what a human verified):** Claude built wireframes and tokens; contrast computed with a script. Human to review style and flows.
- **Artifacts saved in:** `design/wireframes-lofi.html`, `design/design-system.html`, `design/archive/`

## 2026-11-25 — 05b Wireframes v2 + design system v1
- **What we did:** Updated wireframes (v2) and created the design system (`design/design-system.html`). Added "Design & UI principles" to `taste.md` (user request).
- **Why:** Feedback on v1: gender question needs care, nav doesn't belong on the hologram screen, hologram must be 3D (rotate + tap-to-zoom + note), comforting confirm button, severity screen should copy the Apple mood layout, nav should be icons.
- **Decisions:** "Gender" became an optional "body view" (Female / Male / Neutral) with a reason and Skip. Google and email are different sign-ins (email = magic link). Hologram screen has no tab bar and offers a list alternative for accessibility. Voice is added to the note sheet, never the only input. Button copy: "Noted. Take care." Teal palette, Fraunces + Inter, IBM Plex Mono for the hologram only. Contrast checked (WCAG AA).
- **Open:** 3D body model source and voice-to-text approach (see chat).
- **Tools used / where AI helped (and what a human verified):** Claude wrote wireframes and tokens; contrast ratios computed with a script. Human to review taste and wording.
- **Artifacts saved in:** `design/wireframes-lofi.html`, `design/design-system.html`

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
