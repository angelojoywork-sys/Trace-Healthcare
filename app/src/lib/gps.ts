export type Gp = { id: string; name: string; lat: number; lon: number; address?: string; phone?: string; website?: string };
export type GpData = { source: string; generated: string; sites: Gp[] };

let cache: Promise<GpData | null> | null = null;

/** The GP list ships with the app as a static file. Nothing about the user is sent to load it. */
export function loadGps(): Promise<GpData | null> {
  cache ??= fetch("/data/gp-sites.json")
    .then((r) => (r.ok ? (r.json() as Promise<GpData>) : null))
    .then((d) => (d && Array.isArray(d.sites) && d.sites.length ? d : null))
    .catch(() => null);
  return cache;
}

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export const formatKm = (km: number): string => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`);

export function matchesGp(g: Gp, query: string): boolean {
  const h = `${g.name} ${g.address ?? ""}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((t) => h.includes(t));
}
