# 0002: Privacy copy must disclose the analytics

- **Date:** 2026-11-25
- **Step (taste.md):** 6 Deploy
- **Decided by:** AI proposed, I approved ("yes reword the onboarding line", then "fix the settings wording")

## Context
The app sends anonymous behaviour events to PostHog, but the old-prototype Settings and Onboarding screens still said "no trackers" and "nothing is sent to a server".

## Options
1. Leave the wording and rely on the welcome screen's "Test version" notice.
2. Reword the claims so they match what the code sends.

## Decision and why
Option 2. In a health app a privacy claim must match what the code does.

## Evidence
`app/src/lib/analytics.ts` sends events to PostHog EU. The welcome screen already said "We measure how the app is used... never what you log or write". The old screens are only reachable with `?old`.

## Outcome
Reworded in `Settings.tsx` and `Onboarding.tsx` and live from `main`. Not yet done: `research/06-insights-and-requirements.md` still lists "no trackers" as a design principle. Also removed earlier by the user's own feedback round: the voice speech-service line (worth restoring).
