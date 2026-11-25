import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin, Phone, Search, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { distanceKm, formatKm, loadGps, matchesGp, type Gp, type GpData } from "@/lib/gps";

const cap = "font-mono text-[11px] tracking-widest text-muted-foreground uppercase";
const PAGE = 20;
const linkBtn = "h-11 rounded-sm font-mono text-xs tracking-widest uppercase";
type Here = { lat: number; lon: number };
type Loc = "idle" | "asking" | "denied" | "unavailable";

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
    navigator.geolocation.getCurrentPosition(
      (p) => { setHere({ lat: p.coords.latitude, lon: p.coords.longitude }); setLoc("idle"); track("location_granted"); },
      () => { setLoc("denied"); track("location_denied"); },
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

  const hseLink = (
    <a href="https://www.hse.ie/services/find-a-gp/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">
      HSE Find a GP <ExternalLink aria-hidden="true" className="size-3" />
    </a>
  );

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

        {data && !here && loc !== "unavailable" && (
          <section aria-label="Location" className="flex flex-col gap-3 border border-line p-4">
            <p className={cap}>Nearest in this list</p>
            <p>Sort the list by distance from you. Your location stays on this phone and is only used to sort.</p>
            <Button className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={locate} disabled={loc === "asking"}>
              <MapPin className="size-4" />{loc === "asking" ? "Finding you" : "Use my location"}
            </Button>
            {loc === "denied" && <p role="alert" className="text-sm text-muted-foreground">Location is off for this site. You can search by name or town instead, or allow location in your browser settings.</p>}
          </section>
        )}
        {data && here && <p className={cap} aria-live="polite">Nearest in this list</p>}
        {data && (
          <p className="border-l-2 border-highlight pl-3 text-sm text-muted-foreground">
            Partial list: {data.sites.length} of about 2,500 GP practices in Ireland. Your nearest GP may be missing, so check {hseLink} too.
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        {data === undefined && <p className="text-muted-foreground">Loading practices…</p>}

        {data === null && (
          <section className="bracket flex flex-col gap-3 px-5 py-6">
            <h2 className="text-xl font-light">The GP list isn't available yet.</h2>
            <p className="text-muted-foreground">For now, use the HSE's own search to find a practice near you.</p>
            <p>{hseLink}</p>
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
          <footer className="flex flex-col gap-2 border-t border-line pt-4 text-xs text-muted-foreground">
            <p>This list doesn't show whether a practice is taking new patients, or the doctor's gender. Call first, or check {hseLink}.</p>
            <p>Data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline underline-offset-4">OpenStreetMap contributors</a>, {data.generated}. May be out of date.</p>
          </footer>
        )}
      </div>
    </div>
  );
}
