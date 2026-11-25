import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root")!);

if (new URLSearchParams(location.search).has("kit")) {
  // New design system preview (Tailwind + shadcn). Loaded only here so the old app is untouched.
  Promise.all([import("./globals.css"), import("./Kit")]).then(([, { Kit }]) => {
    root.render(<StrictMode><Kit /></StrictMode>);
  });
} else {
  Promise.all([import("./App"), import("./styles.css")]).then(([{ App }]) => {
    root.render(<StrictMode><App /></StrictMode>);
  });
}
