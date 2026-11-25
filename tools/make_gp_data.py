"""Turn a raw OpenStreetMap Overpass JSON export (Irish doctors) into app/public/data/gp-sites.json.

Run:  python3 -I tools/make_gp_data.py <overpass.json> app/public/data/gp-sites.json [YYYY-MM-DD]
Data: (c) OpenStreetMap contributors, ODbL. Keep the attribution in the app.
Keeps named GP-style practices only; drops dentists and specialists.
"""
import json, sys, datetime

src, out = sys.argv[1], sys.argv[2]
stamp = sys.argv[3] if len(sys.argv) > 3 else datetime.date.today().isoformat()
raw = json.load(open(src))

def centroid(geom):
    pts = []
    def walk(c):
        if c and isinstance(c[0], (int, float)): pts.append(c)
        else:
            for x in c: walk(x)
    walk(geom.get("coordinates", []))
    if not pts: return None, None
    return sum(p[1] for p in pts) / len(pts), sum(p[0] for p in pts) / len(pts)

# Accept both raw Overpass JSON ("elements") and GeoJSON ("features", as exported by Overpass Turbo).
if "features" in raw:
    elements = []
    for f in raw["features"]:
        lat, lon = centroid(f.get("geometry") or {})
        props = dict(f.get("properties") or {})
        ident = str(f.get("id") or props.get("@id") or len(elements))
        tags = {k: v for k, v in props.items() if not k.startswith("@")}
        elements.append({"type": ident.split("/")[0] if "/" in ident else "n", "id": ident.split("/")[-1], "lat": lat, "lon": lon, "tags": tags})
    raw = {"elements": elements}

def first(t, *keys):
    for k in keys:
        v = (t.get(k) or "").strip()
        if v: return v
    return ""

def is_gp(t):
    hc = t.get("healthcare")
    if t.get("amenity") == "dentist" or (hc and hc != "doctor"): return False  # drops dentists, podiatrists, physios
    spec = (t.get("healthcare:speciality") or "").lower()
    if spec and not any(w in spec for w in ("general", "family", "gp")): return False
    return True

seen, sites = set(), []
for el in raw.get("elements", []):
    t = el.get("tags") or {}
    name = first(t, "name")
    lat = el.get("lat", (el.get("center") or {}).get("lat"))
    lon = el.get("lon", (el.get("center") or {}).get("lon"))
    if not name or lat is None or lon is None or not is_gp(t): continue
    key = (name.lower(), round(lat, 4), round(lon, 4))
    if key in seen: continue
    seen.add(key)
    street = " ".join(x for x in (first(t, "addr:housenumber"), first(t, "addr:street")) if x)
    parts = [p for p in (street, first(t, "addr:suburb"), first(t, "addr:city", "addr:town", "addr:village"), first(t, "addr:county"), first(t, "addr:postcode")) if p]
    site = {"id": f"{el.get('type','n')[0]}{el['id']}", "name": name, "lat": round(lat, 5), "lon": round(lon, 5)}
    if parts: site["address"] = ", ".join(parts)
    phone = first(t, "phone", "contact:phone")
    if phone: site["phone"] = phone
    web = first(t, "website", "contact:website")
    if web: site["website"] = web
    sites.append(site)

sites.sort(key=lambda s: s["name"].lower())
json.dump({"source": "OpenStreetMap", "generated": stamp, "sites": sites}, open(out, "w"), separators=(",", ":"), ensure_ascii=False)
print("kept", len(sites), "of", len(raw.get("elements", [])), "elements ->", out)
