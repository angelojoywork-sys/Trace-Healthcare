# Starting a new session on Trace

A new session starts from a fresh copy of `main` and does not remember earlier chats. The repo files are the only memory, so what is merged and logged is what carries over.

Repo: https://github.com/angelojoywork-sys/Trace-Healthcare
Live app: https://trace-health-ie.vercel.app/ (builds from `main`)

## Each session

1. **Start with:** "Read `process-log.md`, check open PRs and branches, and tell me where we are."
   This stops the session assuming something isn't built when it sits on another branch.
2. **Say what you want.** One change at a time, for example "reduce the welcome-screen drop-off".
3. **Check the process step.** `CLAUDE.md` makes Claude name the current step from `taste.md` (research, synthesis, journey map, flow, sketch, wireframe, hi-fi, deploy, measure) before building anything.
4. **Review and merge.** Claude works on a branch and opens a PR. You review and merge it. Vercel deploys `main` automatically, so a merge updates the live site.
5. **Before you finish,** say: "Log it, commit, push and open the PR." Anything not merged is invisible to the next session.

## Rules that came from mistakes

- Check every branch (`git branch -r`), not just `main`, before saying something isn't built.
- Keep `main` as the real app. Don't build features on old branches.
- A privacy claim must match what the code sends (the app uses PostHog analytics).
- Log decisions as you go in `process-log.md`: date, what, why, what we learned, tools, where AI helped.

## Open items (as of 2026-11-25)

- Answer the feedback card again in a private window, then check PostHog (eu.posthog.com) for `feedback_ease`, `feedback_use` and `feedback_comment`.
- Look at the welcome-screen drop-off: 11 people opened the app, 1 tapped "Log symptom". Some of the 11 may be previews or bots.
- Delete the old branches on GitHub: `pensive-thompson`, `sharp-edison-1hpxed`, and the two `compassionate-johnson` ones.
- Check which Vercel project owns the domain (`trace-healthcare` or `trace-healthcare-vvkf`) and delete the duplicate.
- Log the PostHog result in `process-log.md`.
- Reword "no trackers" in `research/06-insights-and-requirements.md` when writing the case study.

## Useful facts

- Feedback card: shows on the Summary screen after at least one saved entry. Once answered or dismissed it is hidden on that device. Open the app with `?reset` to wipe local data and see it again, or use a private window.
- The old prototype opens with `?old` in the URL.
- PostHog is connected to your Claude account. In a new session, ask Claude to check PostHog and it will load the tools.
- The Claude environment `trace-healthcare` allows these hosts: `ui.shadcn.com`, `data.gov.ie`, `overpass-api.de`, `trace-health-ie.vercel.app`.
