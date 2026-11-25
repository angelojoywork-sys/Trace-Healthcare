import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root")!);
const params = new URLSearchParams(location.search);

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
