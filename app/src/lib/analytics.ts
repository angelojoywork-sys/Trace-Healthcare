// Measurement for the test round. Sends behaviour only (never symptom text) to PostHog if a key is set.
const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://eu.i.posthog.com";
const opened = Date.now();

function distinctId(): string {
  try {
    let v = localStorage.getItem("trace.did");
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem("trace.did", v);
    }
    return v;
  } catch {
    return "anon";
  }
}

export function track(event: string, props: Record<string, string | number | boolean> = {}): void {
  const properties = { ...props, ms_since_open: Date.now() - opened };
  if (import.meta.env.DEV) console.debug("[track]", event, properties);
  if (!KEY) return;
  fetch(`${HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: KEY, event, distinct_id: distinctId(), properties }),
    keepalive: true,
  }).catch(() => {});
}
