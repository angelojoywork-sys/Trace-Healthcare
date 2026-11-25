# 0003: Keep raw chat transcripts out of the public repo

- **Date:** 2026-11-25
- **Step (taste.md):** process
- **Decided by:** AI decided at the time; I approved the rule when approving the capture system ("ok")

## Context
A subagent saved the user's raw typed messages from an earlier session to a file in the repo. The repo is public and the file had personal details about a third person.

## Options
1. Commit the file, as the Stop hook asked.
2. Move it out of the repo and only commit a summary written in neutral wording.

## Decision and why
Option 2. Publishing someone else's health story was not something the user had asked for.

## Evidence
GitHub reported the repo as not private. The file contained the origin story with a named relationship.

## Outcome
File moved to the session scratchpad. The rule is now in `CLAUDE.md` ("Public repo") and in the `/wrap-up` privacy step.
