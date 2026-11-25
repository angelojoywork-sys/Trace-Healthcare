import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root")!);
const params = new URLSearchParams(location.search);

/** Open the app with ?reset to wipe everything it saved on this phone and start at the welcome screen. */
async function resetLocalData(): Promise<void> {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("trace.") && k !== "trace.did") localStorage.removeItem(k); // keep the anonymous analytics id
  } catch { /* storage unavailable */ }
  await new Promise<void>((resolve) => {
    try {
      const req = indexedDB.deleteDatabase("trace-files");
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
      setTimeout(resolve, 1500);
    } catch { resolve(); }
  });
  params.delete("reset");
  const q = params.toString();
  history.replaceState(null, "", location.pathname + (q ? `?${q}` : "") + location.hash);
}

(async () => {
  if (params.has("reset")) await resetLocalData();
  if (params.has("old")) {
    // Earlier prototype, kept for reference.
    Promise.all([import("./App"), import("./styles.css")]).then(([{ App }]) => {
      root.render(<StrictMode><App /></StrictMode>);
    });
  } else if (params.has("kit")) {
    Promise.all([import("./globals.css"), import("./Kit")]).then(([, { Kit }]) => {
      root.render(<StrictMode><Kit /></StrictMode>);
    });
  } else {
    Promise.all([import("./globals.css"), import("./trace/TraceApp")]).then(([, { TraceApp }]) => {
      root.render(<StrictMode><TraceApp /></StrictMode>);
    });
  }
})();
