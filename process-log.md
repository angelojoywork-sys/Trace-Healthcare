# Process log

Newest first. One entry per working session.

## 2026-11-25 — 06 Deploy (feedback prompt)
- **What we did:** Built a one-question prompt on the Result screen, "Did this help you decide where to go?" (Yes / Somewhat / No). It fires the `feedback_result` event and is asked once per entry.
- **Why:** This answers "did it help them?" in `taste.md` step 7. The answer is one tap, so it fits the happy-path principle.
- **What we learned:** I assumed it already existed. It had only been planned in `taste.md` and the log, so check the code before assuming something was built.
- **Gap:** No free-text quotes yet (they need a backend or form tool). Qualitative quotes will come from usability tests.
- **Tools used / where AI helped (and what a human verified):** AI wrote the component. Build and 9 tests pass. A human still needs to check the event arrives in Vercel.
- **Artifacts saved in:** `app/src/components/Feedback.tsx`

## 2026-11-25 — 06 Deploy (measurement set up before launch)
- **What we did:** Added Vercel Web Analytics (`app/src/lib/analytics.ts`). It tracks visitors, `screen_view` (screen path only) and `entry_saved` (kind: episode, visit or check-in).
- **Why:** Cookieless, no accounts to manage, and the app is already on Vercel. A health app shouldn't send symptoms or other personal data to a third party, so events carry names and screen paths only.
- **What we learned:** The app uses hash routing, so automatic page views would miss navigation. That's why screens are tracked by hand. Custom events may need a paid Vercel plan. Check this in the dashboard.
- **Gap:** Analytics shows usage and drop-off only. Task success, SUS and trust (research/06) still need usability tests. A feedback prompt is not built yet.
- **Tools used / where AI helped (and what a human verified):** `@vercel/analytics`. AI wrote the code; build and 9 tests pass. A human still needs to enable Web Analytics in the Vercel dashboard and check events arrive.
- **Artifacts saved in:** `app/src/lib/analytics.ts`

## 2026-11-25 — 06 Deploy
- **What we did:** Recorded the live Vercel URL: https://trace-health-ie.vercel.app/
- **Why:** Step 6 needs something people can really use. The URL is also needed for usability tests and measurement.
- **What we learned:** Analytics and a feedback prompt still need to be set up before real users arrive.
- **Tools used / where AI helped (and what a human verified):** Vercel. AI only edited the docs.
- **Artifacts saved in:** `README.md`

## YYYY-MM-DD — <step, e.g. 01 Research>
- **What we did:**
- **Why:**
- **What we learned:**
- **Tools used / where AI helped (and what a human verified):**
- **Artifacts saved in:** `<folder>`
