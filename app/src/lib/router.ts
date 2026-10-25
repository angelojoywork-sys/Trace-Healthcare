import { useSyncExternalStore } from "react";

/** Tiny hash router: #/path?query. Hash keeps it working on any static host. */
let visit = 0;

function current() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, query = ""] = raw.split("?");
  // `visit` changes on every navigation so screens start fresh even when the hash repeats.
  return { path, params: new URLSearchParams(query), visit: ++visit };
}

let snapshot = current();

export function useRoute() {
  return useSyncExternalStore(
    (l) => {
      const h = () => {
        snapshot = current();
        window.scrollTo(0, 0);
        l();
      };
      window.addEventListener("hashchange", h);
      return () => window.removeEventListener("hashchange", h);
    },
    () => snapshot,
  );
}

export function go(to: string) {
  location.hash = to;
}
