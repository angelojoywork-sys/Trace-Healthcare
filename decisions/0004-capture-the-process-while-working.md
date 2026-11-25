# 0004: Capture the process while working, not afterwards

- **Date:** 2026-11-25
- **Step (taste.md):** process, case study
- **Decided by:** AI proposed, I approved ("ok"). The direction was the user's: "how can we make this sustainable for the future".

## Context
The user will start many sessions on one project and needs to show their thinking and process in a portfolio. Reconstructing history from transcripts took many pages of tool output for about a third of one session and still missed things.

## Options
1. Read old session transcripts each time the case study needs evidence.
2. Capture decisions at the time: a `/wrap-up` command, tagged log entries, decision records, and a living case-study outline.

## Decision and why
Option 2. Capturing a decision when it is made takes one line. Transcripts are huge, private and hard to search.

## Evidence
Reading the earlier transcript took about 30 pages of events and two agents. The log alone already held most phases, but not who decided or the user's own corrections.

## Outcome
Built in PR #8 and merged. `/wrap-up` has now been run once (this entry). Not yet tested across sessions: check next time that a new session picks the files up.
