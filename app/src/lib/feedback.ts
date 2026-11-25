export type FeedbackState = "open" | "dismissed" | "done";
const KEY = "trace.feedback";

export function loadFeedback(): FeedbackState {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dismissed" || v === "done" ? v : "open";
  } catch {
    return "open";
  }
}

export function saveFeedback(v: FeedbackState): void {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* storage unavailable: the prompt may show again next visit */
  }
}
