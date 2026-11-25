# Process log

Newest first. One entry per working session.

## 2026-11-25 — 06s Reset link
- **What we did:** Opening the app with `?reset` (for example `/?reset`) now wipes everything it saved on the phone (profile, logs, feedback state, attached photos) and starts at the welcome screen. The `?reset` part is removed from the address afterwards. The anonymous analytics id is kept so a reset does not look like a new person in the numbers.
- **Why:** The welcome screen only shows to people with no saved profile, so the person building the app (and testers who want to start over) could not see it again without digging in browser settings.
- **Verified:** headless run: saved data present, `/?reset` shows the welcome screen, saved keys and photo database cleared, unrelated keys and the analytics id kept, other URL parameters kept; no console errors.
- **Artifacts saved in:** `app/src/main.tsx`, `research/tester-note.md`

## 2026-11-25 — 06r Severity visual: light at mild, builds with severity
- **What we did:** Reworked the severity letters. Very mild is now light: a few faint, small letters loosely drifting, with no fixed shape. Each step up adds more letters (they fade in one by one), makes them bigger and brighter, moves them faster, scatters them further and warms the colour from teal to orange. Everything eases between levels.
- **Why:** User feedback: the clean helix at very mild was too rigid and heavy; the intensity should start light and keep increasing.
- **Decisions:** Kept the letters of the severity word and a faint spiral underneath, but the loose scatter means it reads as a cloud, not a structure. The word label stays under the picture so the picture is never the only signal.
- **Verified:** headless screenshots at all five levels show a smooth build from near-empty to dense; no console errors.
- **Open:** Real-phone frame rate; whether the word or a fixed word (TRACE) reads better.
- **Artifacts saved in:** `app/src/trace/LetterHelix.tsx`

## 2026-11-25 — 06q DNA on the welcome screen, letter helix on severity
- **What we did:** Welcome screen: replaced the glow ball with a glossy 3D double helix in the brand colours (teal at the bottom to amber at the top, with rungs), built in code with three.js (no model file), slowly turning; the old glow shape is the fallback while it loads and when 3D is unavailable. Severity screen: replaced the glow shape with a helix made of letters that spell the chosen severity word; as severity rises the letters drift away from the helix, fan out and jitter (very mild is a clean spiral, very severe is scattered and warmer in colour). Plain 2D canvas, no WebGL.
- **Why:** User references (glossy DNA, lettered helix, numbered helix, stone-and-glow). The letter helix makes the severity slider a felt, visual change instead of a label; the DNA gives the welcome screen an identity.
- **Decisions:** Used the glossy reference for the welcome DNA rather than the stone texture. Severity is still shown as a word, so colour and scatter are never the only signal. Respects reduced motion (static drawing). DNA imagery does not mean genetic data: copy still says symptoms, doctors, prescriptions.
- **Tuning:** First version had too many letters, so the mild state looked like a dense column; reduced the count and turns until the helix reads clearly.
- **Verified:** headless screenshots at very mild, moderate and very severe; no console errors.
- **Open:** Test frame rate of the severity canvas on a real phone; stone-texture variant of the DNA if wanted; numbered rungs (Anthrogen idea).
- **Artifacts saved in:** `app/src/trace/DnaMark.tsx`, `app/src/trace/LetterHelix.tsx`

## 2026-11-25 — 06p Tester note
- **What we did:** Wrote `research/tester-note.md`: a short message to send with the link, six tasks (about 5 minutes) taken from the flows, what is and is not measured, known limits (partial GP list, optional location and mic, recent browsers), a contact line, and a pre-send checklist.
- **Why:** Testers need a clear, honest brief, and the privacy promise must match what the app actually sends.
- **Decisions:** Tasks mirror flows A to E and the events in the test plan. The note says plainly that symptoms, notes, GP names, photos and search words never leave the phone. Placeholders left for the tester's name and the researcher's contact (not filled in on the user's behalf).
- **Open:** Set `VITE_POSTHOG_KEY`, turn off Vercel Authentication, try it on a real phone, then run 5 to 8 testers and record date, method and sample size here.
- **Artifacts saved in:** `research/tester-note.md`

## 2026-11-25 — 06o In-app feedback prompt and measurement clean-up
- **What we did:** Added a feedback card on Summary after the first saved log: "How easy was it to log that?" (1-5), "Would you use this after a GP visit?" (1-5), then an optional comment. Can be dismissed ("Not now") and reopened from a link on Summary. Added a one-line test notice on the welcome screen. Updated `research/test-plan.md`.
- **Why:** The case study needs "did it help" evidence: ease and intent scores, plus quotes.
- **Privacy fix:** Found that analytics was also sending the body area, the severity value and the chosen body view. Removed them, so events are behaviour only. The only free text sent is the optional feedback comment, which asks people not to include health details.
- **Bug fix:** Leaving the hologram screen disposed the 3D context and fired a false "webgl_unavailable" event on every log. Now only a context loss while the screen is visible counts.
- **Verified:** headless run with analytics intercepted: events correct, scores 4 and 5 and the comment captured, no area/value/view properties, card stays gone after finishing and after reload, dismiss then reopen link works; no console errors.
- **Open:** Needs `VITE_POSTHOG_KEY` in Vercel or scores go nowhere. Photo resizing. Share sheet on real phones. A contact line for testers.
- **Artifacts saved in:** `app/src/trace/FeedbackCard.tsx`, `app/src/lib/feedback.ts`

## 2026-11-25 — 06n Delete a log (with undo)
- **What we did:** Added "Delete this log" at the bottom of Entry detail. The log leaves the list immediately and a bar on Summary or Browse offers Undo for 10 seconds. Photos are kept until the time is up, then removed. On every app start, photos whose log no longer exists are purged (covers closing the tab during the undo window).
- **Why:** Testers will log mistakes; prescription photos are hard to recreate, so deletion must be forgiving. Also a privacy point: deleted means gone from the phone.
- **Decisions:** Undo bar instead of a confirmation dialog (fewer taps, recoverable). The delete button is outlined, not filled, and sits away from the main actions.
- **Verified:** headless run: delete, toast, undo restores the entry and its photo; waiting 10 s removes the photo; orphaned photos purged on reload; no console errors.
- **Open:** Resize photos at capture; test the share sheet on real phones; HSE API reply; measure with real testers.
- **Artifacts saved in:** `app/src/trace/TraceApp.tsx`, `EntryScreen.tsx`, `app/src/lib/entries.ts`, `app/src/lib/files.ts`

## 2026-11-25 — 06m Share pack for claims
- **What we did:** Built Share visit (a share icon on Entry detail). The person ticks what to include (visit details always; name, symptom note, what the GP said, each file), then taps Share (phone share sheet, with the PDF and any PDF attachments as files), Save PDF, or Copy summary. The PDF is made on the phone: one summary page, then each selected photo on its own page (photos are resized to 1600 px and compressed).
- **Why:** Insurance claims were part of the original problem (the girlfriend needing the prescription and visit details to claim).
- **Decisions:** Nothing is uploaded; the user chooses where it goes. Name is opt-in per share. PDF attachments cannot be merged into the PDF client-side, so they are sent as separate files. jsPDF (MIT) is loaded only when a PDF is made. This also resizes photos for the PDF, but stored originals are not resized yet.
- **Verified:** headless run: rows shown, PDF downloads (valid, 2 pages with a photo; 1 page when the photo is unticked and the GP note removed), copy summary text correct, no console errors. The native share sheet cannot be tested in a headless browser; test on a phone.
- **Research:** HSE Health Directory API (doctors and locations) is available on request per HIQA and eHealth Ireland; no public application form found. Plan: email eHealth Ireland.
- **Open:** Test share sheet on iPhone and Android; photo resizing at capture; delete entry; HSE API request.
- **Artifacts saved in:** `app/src/trace/SharePack.tsx`, `app/src/lib/sharepack.ts`

## 2026-11-25 — 06l Find GP data loaded (OpenStreetMap, partial)
- **What we did:** User exported Irish doctor data from Overpass Turbo (661 raw records; the GeoJSON and JSON exports held the same data). Converted with `tools/make_gp_data.py` to `app/public/data/gp-sites.json`: 524 practices (dropped nameless entries, dentists, podiatrists, physios and non-GP specialists). 199 have a phone, 190 a website, 339 an address. Raw file kept in `data/raw/`.
- **Finding (important for the case study):** 524 of about 2,500 practices the HSE lists is roughly 21% coverage. Dublin is the best covered (75 with Dublin in the address); most counties have only a handful.
- **Decision:** Ship it with honesty built in: a visible "Partial list: 524 of about 2,500" note, "Nearest in this list" wording instead of "nearest", and a standing link to HSE Find a GP. Not claiming completeness. Completing it needs a paid or licensed source (Google Places with a billing account, or the HSE Health Directory API on request).
- **Verified:** headless run with the real file and a Dublin location: nearest practices are in central Dublin, search by town works, no console errors.
- **Open:** Decide whether to pursue fuller data; share pack for claims; photo resizing; delete entry.
- **Artifacts saved in:** `app/public/data/gp-sites.json`, `data/raw/overpass-ie-doctors-2026-11-25.json`

## 2026-11-25 — 06k Find GP (screen built, data pending)
- **What we did:** Built the Find GP tab: "Use my location" (sorts nearest first, location never leaves the phone), search by practice name or town, Call / Directions / Website links, "Show more", a footer saying what the list cannot tell you (new-patient availability, doctor gender) with a link to HSE Find a GP, and OpenStreetMap attribution. Added `tools/make_gp_data.py` to turn a raw OpenStreetMap export into `app/public/data/gp-sites.json`. Allowed geolocation in `vercel.json` (it was blocked).
- **Why:** The last tab; helps people find a practice, and shows honestly what public data can and cannot do.
- **Research update:** The HSE "Family Practice (GP) Sites" dataset is no longer in the data.gov.ie catalogue (checked live: dataset page 404, searches empty). OpenStreetMap is the free fallback. This environment's connection to the Overpass server is reset, so the user exports the data from overpass-turbo.eu and uploads it to the repo.
- **Decisions:** No fake data in the app: until the real file exists the tab shows an honest "not available yet" state with the HSE link. The data ships as a static file so nothing about the user is sent anywhere to load it. No Eircode search (needs a paid geocoder); name or town search instead.
- **Verified:** headless run with a synthetic fixture kept only in scratch (never committed): converter drops dentists, specialists and nameless entries; sorting by distance; search; tel link; geolocation; no-data state; no console errors.
- **Open:** Real data file; check its completeness against HSE's ~2,500 practices; share pack for claims; photo resizing; delete entry.
- **Artifacts saved in:** `app/src/trace/GpScreen.tsx`, `app/src/lib/gps.ts`, `tools/make_gp_data.py`

## 2026-11-25 — 06j Browse and search
- **What we did:** Built Browse: a month-grouped timeline of every log, a search bar (symptom, area, GP name, notes, what the GP said, severity words), result count with "first logged" date when something recurs, file counts per entry, and tap-through to Entry detail. Search text survives going to an entry and back.
- **Why:** This is the "it happened again" payoff from the flows: search "headache" and see every time, who treated it and what worked.
- **Decisions:** Search runs on the phone. Analytics records only the length of a search and the number of results, never the words. Matching is all-words, case-insensitive substring.
- **Verified:** headless run with four seeded entries across three months: grouping, "headache" gives 3 results with first date, GP name and severity searches work, no-match message, clear button, back from an entry keeps the query; no console errors.
- **Open:** Find GP (HSE data), share pack for claims, photo resizing, delete entry, filters (with visit, with files).
- **Artifacts saved in:** `app/src/trace/BrowseScreen.tsx`

## 2026-11-25 — 06i Entry detail + GP data research
- **What we did:** Built Entry detail: visit date, GP (free text with last-used suggestions), what the GP said, and prescription or receipt photos or files. Everything saves as you type (no Save button). Photos are stored in the phone's IndexedDB, never uploaded. Summary rows and the Last logged card now open it; the Visits count is live; a prompt "Add GP visit details" shows until a visit is recorded. Researched GP location data for Find GP.
- **Why:** This is the part that solves the original problem (remembering what each GP said and keeping prescriptions for claims).
- **Decisions:** GP is free text, not a managed list (user agreed). Share/export deferred until Browse exists. Photos are not resized yet.
- **Research (desk, Nov 2025):** No open GP-search API in Ireland. HSE "Family Practice (GP) Sites" dataset on data.gov.ie has GPS coordinates but is a 2022 snapshot. The HSE Health Directory Doctors/Locations API is available on request, not open. OpenStreetMap is free but patchy. Google Places gives the best data but needs a billing account. None gives GP gender or whether a practice takes new patients.
- **Verified:** headless run: open entry, fill fields, attach a file, back (Visits becomes 1), reload (all kept, thumbnail kept), no console errors.
- **Open:** Browse and search, Find GP, share pack for claims, photo resizing, delete entry.
- **Artifacts saved in:** `app/src/trace/EntryScreen.tsx`, `app/src/lib/files.ts`, `app/src/lib/entries.ts`

## 2026-11-25 — 06h Summary screen and icon nav
- **What we did:** Built the Summary home (last logged, this month and all-time counts, recent list, empty state, "+" button, saved confirmation) and the three-icon bottom nav (Summary, Find GP, Browse). After a save, people land on Summary. The hologram screen gained a Close button so people can leave without logging. Returning users open on Summary.
- **Why:** It completes the first loop (log, save, see it) and is where people land most often.
- **Decisions:** Find GP and Browse are honest placeholders until built. Recent rows are not tappable until Entry detail exists. "Visits" count left out until GPs can be recorded. Severity always shows a word plus a coloured marker. The old separate "Saved" screen was replaced by a confirmation on Summary.
- **Verified:** headless run: welcome, profile, close to empty state, log, save, Summary with confirmation, second log via "+", Browse placeholder, Summary again; 2 entries stored; no console errors.
- **Open:** Entry detail (date, GP, what the GP said, photo or file), Browse and search, Find GP.
- **Artifacts saved in:** `app/src/trace/SummaryScreen.tsx`, `BottomNav.tsx`, `dates.ts`, `TraceApp.tsx`

## 2026-11-25 — 06g Welcome screen
- **What we did:** Built the welcome screen (bracket frame, pulsing glow mark, "Remember every visit.", Log symptom, Continue with Google). New users see it first, then name and gender, then the hologram. Returning users go straight to the hologram.
- **Why:** First screen of the happy path (wireframe 1).
- **Decisions:** "Continue with Google" is shown but disabled, with a line saying back-up is coming soon, because real Google sign-in needs a backend (Supabase) we have not set up. No dead buttons: the filled primary button is the one that works. "Log symptom" leads to name and gender (skippable) so the body choice is never skipped by accident. Wireframe flow B (guest) now includes that skippable step.
- **Verified:** headless run: welcome, profile, skip, hologram; reload skips welcome; no console errors.
- **Open:** Real Google sign-in (Supabase, EU region), then Summary, Entry, Browse, Find GP.
- **Artifacts saved in:** `app/src/trace/WelcomeScreen.tsx`

## 2026-11-25 — 06f Name and gender screen drives the hologram body
- **What we did:** Built the name and gender screen (first screen for new users). Gender picks the body: Female = female, Male = male, Other / Prefer not to say / Skip = neutral. Saved on the phone (`trace.profile`). Added a "Change body" control on the hologram screen (Female / Male / Neutral). The `?body=` test switch is gone.
- **Why:** User: the body should be established at the start from the gender choice, and be changeable later.
- **Decisions:** Gender is asked as a plain optional choice with one line saying why; the body can be changed independently from the gender label. Analytics records only whether a name or gender was given, never the values.
- **Verified:** headless run: profile, female body, change to male, reload keeps the choice, no console errors.
- **Open:** Welcome screen (Google / Log symptom), Summary, Entry, Browse, Find GP. A profile/settings screen to change name and gender later.
- **Artifacts saved in:** `app/src/lib/profile.ts`, `app/src/trace/ProfileScreen.tsx`, `app/src/trace/BodyScreen.tsx`

## 2026-11-25 — 06e Deploy: first Vercel attempt
- **What we did:** Imported the repo into Vercel. First build failed: `cd app: No such file or directory`.
- **Why:** Vercel built `main`, which has no `app/` folder; the work lives on the feature branch.
- **Fix:** Set the Vercel Production Branch to the feature branch and pushed a new commit to trigger a build (redeploying the failed `main` build would have repeated the failure).
- **Learnings:** Redeploy reuses the old deployment's source, so a branch change needs a new push. Preview links are protected by default; turn off Vercel Authentication before sharing with testers.
- **Tools used / where AI helped (and what a human verified):** Claude reproduced the build from a clean checkout (it passed) and read the log the user pasted; the user changed the Vercel settings and confirmed.

## 2026-11-25 — 06d Hologram v4: clean face via mesh segmentation
- **What we did:** Replaced the geometric mouth hack with Anny's own face segmentation: the exporter now drops the mouth cavity, tongue and eye sockets (`mouth_cavity`, `tongue`, `eye_cavity.*`, `eye_back.*`) before conversion. Eyeball fronts stay. Orphan vertices are removed. Bodies shrank to ~500 KB each (12.5k verts).
- **Why:** User asked whether clean figures can come straight from MakeHuman. Anny is built from MakeHuman's data and exposes its labelled mesh parts, so removing the cavities at source is cleaner than hand-cleaning in Blender or guessing in code.
- **Learnings:** The MakeHuman desktop app is a GUI and cannot be driven from here. The labelled mesh parts in Anny give the same result without it.
- **Open:** Muscle/anatomical detail (the reference shows more), real-phone frame rate, wiring body choice to the profile screen.
- **Artifacts saved in:** `tools/export_anny_bodies.py`, `tools/make_body_glb.py`, `app/public/models/`

## 2026-11-25 — 06c Hologram v3: adult female, male and neutral bodies
- **What we did:** Ran the Anny generator (PyPI `anny`, Apache-2.0, free, CPU only) in a scratch environment via `tools/export_anny_bodies.py` to produce adult female, male and neutral bodies (age 0.667). Converted each with `tools/make_body_glb.py` (relative heights kept, eyes, tongue and most of the mouth interior removed). `?body=female|male|neutral` selects the body until the profile screen exists.
- **Why:** The single baked body in the npm package was child-like. The name/gender screen already offers three options.
- **Decisions:** male = gender 0, female = gender 1, neutral = 0.5. Face lines are softened in the shader. No cost: everything used is open source and run locally.
- **Learnings:** The default rig puts all head vertices on one bone, so the mouth interior had to be found by geometry. Some mouth noise remains.
- **Open:** Face polish (mouth/eyes), test frame rate on a real phone, wire body choice to the profile screen.
- **Tools used / where AI helped (and what a human verified):** Claude generated and converted the meshes and checked screenshots; human to judge the final look.
- **Artifacts saved in:** `tools/`, `app/public/models/body-{female,male,neutral}.glb`

## 2026-11-25 — 06b Hologram v2: real body model + hologram shader
- **What we did:** Replaced the stacked shapes with a real human body mesh (Anny, Apache-2.0, built on MakeHuman CC0 assets) converted to GLB by `tools/make_body_glb.py` (13k verts, 535 KB, per-vertex body-region tags). New hologram shader: ~200 fine contour lines, glowing rim, slow scan sweep, bloom, and glowing lines that wrap the surface around a tap (from the rock reference). Camera zooms out further and aims below the tap so it clears the note panel.
- **Why:** User: stacked shapes are not professional; wants the look of the two-body hologram reference at the same detail.
- **Decisions:** Procedural shapes dropped. Attribution in `app/public/models/ATTRIBUTION.md`. Eyes and tongue removed from the mesh (they read as noise). Body regions come from the skinning weights, so taps map to real anatomy (head, neck, chest, abdomen, hip, arm, forearm, hand, leg, foot, with left/right and front/back).
- **Learnings:** The only body in the `anny-js` package is one baked neutral, young-looking body (gender 0.5, age 0.3). Adult female, male and neutral need the Anny generator (PyPI `anny`, needs PyTorch). The permission check blocked running that package in a scratch environment, so it waits on the user. Fine lines only read on high-density screens (checked at 2x); at 1x they fade on purpose to avoid shimmer.
- **Open:** Adult female/male/neutral bodies; face/mouth interior still looks odd on the neutral body; test on a real phone for frame rate.
- **Tools used / where AI helped (and what a human verified):** Claude found the model via web search, wrote the converter and shader, and checked with headless-browser screenshots; human to judge the look and test on device.
- **Artifacts saved in:** `tools/make_body_glb.py`, `app/public/models/`, `app/src/trace/HologramCanvas.tsx`

## 2026-11-25 — 06 Hi-fi build: screens 3 to 5 (hologram, note, severity)
- **What we did:** Built the first real screens in `app/src/trace/`: 3D hologram (three.js, procedural body, rotate, tap-to-zoom, marker), note pop-up (X/Y, area, when, note, voice, "Almost there"), severity screen, and a placeholder "Saved" screen. Entries save to the phone (localStorage). Added `track()` analytics wrapper (PostHog, behaviour only) and `research/test-plan.md`.
- **Why:** These screens carry the most risk and are the core of the product. Measurement must exist before launch.
- **Decisions:** Procedural body (no model download) so taps map to named regions and the 3D cannot fail on a missing asset. WebGL check and context-loss fallback switch to List view. Voice uses the browser speech API and is hidden where unsupported. Slider thumb enlarged to meet the 44px rule. Hosting: Vercel (already configured). Supabase deferred until we need sign-in and backup.
- **Learnings:** The body is a stylised stand-in; a real model is a later swap. Camera aims below the tapped point so the marker stays clear of the note panel.
- **Open:** Welcome and name/gender screens, Summary, Entry, Browse, Find GP. Real body model. Chunk size warning (3D is lazy-loaded already).
- **Tools used / where AI helped (and what a human verified):** Claude wrote the code and drove a headless browser through the flow with screenshots; human to test on a real phone.
- **Artifacts saved in:** `app/src/trace/`, `app/src/lib/`, `research/test-plan.md`

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
