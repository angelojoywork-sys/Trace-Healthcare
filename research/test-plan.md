# Test plan (MVP round 1)

## Goal
Find out whether people can log a symptom quickly from the hologram, and whether they would use it again.

## Who and how
- 5 to 8 people, mixed ages. Unmoderated link plus a short follow-up chat with 2 or 3.
- Date, method and sample size go in `process-log.md` after the round.

## Tasks (from the flows)
1. Log a symptom on your own body (Flow A/B).
2. Log it again using List view.
3. (Later builds) Add a GP and a prescription photo (Flow C). Find an old entry by search (Flow D).

## What we measure (behaviour only, never symptom text)
| Question | Event |
|---|---|
| Did they start? | `app_open` |
| Did the hologram work? | `area_selected` (via 3d/list), `webgl_unavailable` |
| Did they add detail? | `note_added` (length only), `voice_used` |
| Did they finish? | `severity_set`, `log_saved` |
| Did it help? | `feedback_ease` (1-5), `feedback_use` (1-5), `feedback_comment` (optional text, asks people not to include health details) |
| Did they use the extras? | `entry_opened`, `gp_added`, `file_added`, `share_pack_done`, `search`, `gp_search`, `gp_call`, `gp_directions`, `entry_deleted` |
| How fast? | `ms_since_open` on every event. Time to first `log_saved` = time on task. |
| Drop-off | Funnel: app_open, area_selected, severity_set, log_saved |

The in-app prompt appears on Summary after the first saved log: How easy was it to log that (1-5)? Would you use this after a GP visit (1-5)? Anything confusing or missing (optional)? It can be dismissed, and reopened from a link on Summary.

No event carries the body area, severity, GP name, notes or search words. Only the optional feedback comment is free text.

## Privacy rules
- Symptom notes stay on the tester's phone. They are not sent anywhere.
- Analytics: PostHog, EU region, anonymous random ID, no names or free text.
- Testers see one line on the welcome screen: "Test version. We measure how the app is used (which screens, how long, whether it worked), never what you log or write." Add a contact line when you share the link.
- Real symptom data is never needed for the case study. Behaviour numbers and quotes are enough.

## Deploy
Vercel (already configured in `vercel.json`): connect the repo, set `VITE_POSTHOG_KEY`, deploy. Share the URL.

## Later
Supabase (EU region) for Google sign-in and backup, once we want logs to follow the user across devices.
