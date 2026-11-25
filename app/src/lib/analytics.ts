import { inject, track as vaTrack } from "@vercel/analytics";

/**
 * Privacy-first analytics (Vercel Web Analytics: no cookies, no personal IDs).
 * Rule: events carry NO health data. Names and screen paths only, never
 * symptoms, words, medicines, doors or ids.
 */
export function initAnalytics() {
  // Hash routes are not seen as page views, so screens are tracked below.
  if (import.meta.env.PROD) inject({ mode: "production" });
}

export function track(event: string, props?: Record<string, string>) {
  if (!import.meta.env.PROD) return;
  try {
    vaTrack(event, props);
  } catch {
    /* analytics must never break the app */
  }
}
