---
name: wrap-up
description: End-of-session capture for the Trace portfolio case study. Writes the process-log entry, any decision records and the case-study outline links, then commits and pushes on the session branch. Use when the user says "wrap up", "log it", or ends a session.
---

# Wrap up the session

Goal: capture the thinking while it is fresh, in a fixed structure, so the case study can be assembled from it later. Keep it short. Plain language.

## Steps

1. **Collect the facts, don't ask for what git can tell you.**
   - Read the top of `process-log.md` (the last entry) and run `git log --oneline origin/main..HEAD` plus `git status --short`.
   - Note what changed this session: features, fixes, reverts, research, decisions.
2. **Write one log entry** at the top of `process-log.md` (newest first), using the template at the bottom of that file. Split into several entries only if the session covered different steps.
   - Tag each bullet with its type: `[decision]`, `[failure]`, `[learning]`, `[research]`, `[metric]`.
   - **Decided by:** say who decided each decision: *me*, *AI proposed, I approved*, or *AI*. Never guess. If unclear, ask the user one short question.
   - Quote the user's own words when they reject, correct or set a rule (short, as written).
   - Name the tools used and where AI helped, and what a human verified.
3. **Decision records.** For each important decision (it changed direction, cost effort, or shaped the design), copy `decisions/_template.md` to `decisions/NNNN-short-title.md` (next number) and fill it in. Link it from the log entry.
4. **Screenshots.** If the UI changed, save before/after screenshots under `design/03-prototype/screenshots/YYYY-MM-DD-<topic>/` and link them. Use Playwright against the live site or a local build.
5. **Case-study outline.** Update `case-study/outline.md`: add links to the new log entries, decisions and screenshots under the right section, and update its status and gaps.
6. **Privacy check.** The repo is public. Never commit raw chat transcripts, names, health details of real people, API keys or personal data. Use "partner", "tester" or similar.
7. **Commit and push** on the session branch. Do not open or merge a PR unless the user asks. Then say in two lines what was logged and what is still open.

## Rules

- Propose, then wait. Don't change `taste.md` unless the user asks.
- Only record what happened. If a result wasn't checked, say "not checked".
- Never say something isn't built without checking every branch (`git branch -r`).
