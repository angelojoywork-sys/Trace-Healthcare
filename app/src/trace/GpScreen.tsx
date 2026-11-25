import { useEffect, useMemo, useState } from "react";
import { MapPin, Phone, Search, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { distanceKm, formatKm, loadGps, matchesGp, type Gp, type GpData } from "@/lib/gps";

const cap = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";
const PAGE = 20;
const linkBtn = "h-11 rounded-sm font-mono text-xs tracking-widest uppercase";
type Here = { lat: number; lon: number };
type Loc = "idle" | "asking" | "denied" | "unavailable" | "timeout";

const LOC_MESSAGE: Record<Exclude<Loc, "idle" | "asking">, string> = {
  denied: "Location is blocked for this site. Allow it in your browser, or on iPhone in Settings, Privacy & Security, Location Services, Safari Websites. You can also search by name or town.",
  unavailable: "Your phone couldn't work out where you are. Check that Location Services is on and try again, or search by name or town.",
  timeout: "That took too long. Try again, or search by name or town.",
};

const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const directionsHref = (g: Gp) => `https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lon}`;
const webHref = (w: string) => (/^https?:\/\//i.test(w) ? w : `https://${w}`);

export function GpScreen() {
  const [data, setData] = useState<GpData | null | undefined>(undefined);
  const [here, setHere] = useState<Here | null>(null);
  const [loc, setLoc] = useState<Loc>("idle");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => { loadGps().then(setData); }, []);
  useEffect(() => setLimit(PAGE), [query, here]);

  const locate = () => {
    if (!("geolocation" in navigator)) { setLoc("unavailable"); return; }
    setLoc("asking");
    track("location_requested");
    let settled = false;
    const settle = (next: Loc) => { if (settled) return false; settled = true; window.clearTimeout(timer); setLoc(next); return true; };
    // Some browsers never answer if the permission prompt is dismissed, so give up after 20 seconds.
    const timer = window.setTimeout(() => { if (settle("timeout")) track("location_timeout"); }, 20000);
    navigator.geolocation.getCurrentPosition(
      (p) => { if (settle("idle")) { setHere({ lat: p.coords.latitude, lon: p.coords.longitude }); track("location_granted"); } },
      (err) => { if (settle(err.code === 1 ? "denied" : err.code === 2 ? "unavailable" : "timeout")) track("location_error", { code: err.code }); },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  };

  const q = query.trim();
  const rows = useMemo(() => {
    if (!data) return [];
    const list = (q ? data.sites.filter((g) => matchesGp(g, q)) : data.sites).map((g) => ({ g, km: here ? distanceKm(here.lat, here.lon, g.lat, g.lon) : null }));
    return here ? list.sort((a, b) => (a.km as number) - (b.km as number)) : list;
  }, [data, q, here]);

  useEffect(() => {
    if (!q) return;
    const t = setTimeout(() => track("gp_search", { length: q.length, results: rows.length }), 700);
    return () => clearTimeout(t);
  }, [q, rows.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-4 px-5 pt-6 pb-3">
        <h1 className="text-3xl font-light">Find a GP</h1>

        {data === null || data?.sites.length === 0 ? null : (
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" aria-label="Search by practice name or town" placeholder="Search by name or town" value={query} onChange={(e) => setQuery(e.target.value)} className="h-12 rounded-sm pr-12 pl-10 [&::-webkit-search-cancel-button]:hidden" />
            {query && (
              <Button type="button" variant="ghost" size="icon" aria-label="Clear search" onClick={() => setQuery("")} className="absolute top-1/2 right-0 size-12 -translate-y-1/2 rounded-sm"><X className="size-4" /></Button>
            )}
          </div>
        )}

        {data && !here && (
          <section aria-label="Location" className="flex flex-col gap-3 border border-line p-4">
            <p className={cap}>Nearest first</p>
            <p>Sort the list by distance from you. Your location stays on this phone.</p>
            <Button className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={locate} disabled={loc === "asking"}>
              <MapPin className="size-4" />{loc === "asking" ? "Finding you" : "Use my location"}
            </Button>
            {loc !== "idle" && loc !== "asking" && <p role="alert" className="text-sm text-muted-foreground">{LOC_MESSAGE[loc]}</p>}
          </section>
        )}
        {data && here && <p className={cap} aria-live="polite">Nearest first</p>}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-32">
        {data === undefined && <p className="text-muted-foreground">Loading practices…</p>}

        {data === null && (
          <section className="bracket flex flex-col gap-3 px-5 py-6">
            <h2 className="text-xl font-light">The GP list isn't available right now.</h2>
            <p className="text-muted-foreground">Please try again later.</p>
          </section>
        )}

        {data && rows.length === 0 && <p className="max-w-[34ch] text-muted-foreground">No practices match “{q}”. Try a town or part of a name.</p>}

        {data && rows.length > 0 && (
          <>
            {q && <p className={cap} aria-live="polite">{rows.length} {rows.length === 1 ? "practice" : "practices"}</p>}
            <ul className="flex flex-col gap-3">
              {rows.slice(0, limit).map(({ g, km }) => (
                <li key={g.id} className="bracket flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-lg font-light">{g.name}</h2>
                    {km !== null && <span className={cap}>{formatKm(km)}</span>}
                  </div>
                  {g.address && <p className="text-sm text-muted-foreground">{g.address}</p>}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {g.phone && (
                      <a href={telHref(g.phone)} onClick={() => track("gp_call")} className={cn(buttonVariants({ variant: "outline" }), linkBtn)}>
                        <Phone className="size-4" />Call
                      </a>
                    )}
                    <a href={directionsHref(g)} target="_blank" rel="noreferrer" onClick={() => track("gp_directions")} className={cn(buttonVariants({ variant: "outline" }), linkBtn)}>
                      <MapPin className="size-4" />Directions
                    </a>
                    {g.website && (
                      <a href={webHref(g.website)} target="_blank" rel="noreferrer" onClick={() => track("gp_website")} className={cn(buttonVariants({ variant: "ghost" }), linkBtn, "underline underline-offset-4")}>Website</a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {rows.length > limit && (
              <Button variant="outline" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={() => setLimit(limit + PAGE)}>Show more</Button>
            )}
          </>
        )}

        {data && (
          <footer className="pt-2 text-xs text-muted-foreground">
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline underline-offset-4">© OpenStreetMap contributors</a>
          </footer>
        )}
      </div>
    </div>
  );
}
