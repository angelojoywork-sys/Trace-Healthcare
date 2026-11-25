# 0001: `main` is the single live source

- **Date:** 2026-11-25
- **Step (taste.md):** 6 Deploy
- **Decided by:** AI proposed, I approved ("yes do this")

## Context
The live site was built from an unmerged branch (`claude/pensive-thompson-djxj50`), while `main` held an older prototype. A new session cloning `main` would not see the real app, and a duplicate analytics and feedback setup had been added to `main` by mistake.

## Options
1. Keep the old branch as production and leave `main` behind.
2. Revert the duplicate code on `main`, merge the live app into `main`, and point Vercel's Production Branch at `main`.

## Decision and why
Option 2. Work on an unmerged branch is invisible to a new session, so `main` must hold the real app.

## Evidence
The live script changed from `index-BR_MQyX8.js` (old branch) to `index-CMCn05b4.js` after the Production Branch was switched and the site redeployed. Pull requests #4 and #5 carry the change.

## Outcome
Confirmed live from `main`. A new session now starts from the real app. Lesson logged: check every branch before saying something isn't built.
