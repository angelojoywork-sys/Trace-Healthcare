"""Build the hologram body GLB from the Anny body model's rest mesh (Apache-2.0, Naver).

Input: the `assets/` folder of the `anny-js` npm package (anny_model.json + anny_model.bin).
Output: a GLB with POSITION, NORMAL, COLOR_0 (R = region id, G = side) and indices.
Run:  python3 -I tools/make_body_glb.py <dir with anny_model.json/.bin> <out.glb> [reference_height_m]
Pass the same reference height for every body so their relative heights are kept.
Z-up Anny metres -> Y-up, person facing +Z, person's left on +X, 3.6 units tall, feet at y = -1.8.
"""
import json, struct, sys, math
from array import array

src, out = sys.argv[1], sys.argv[2]
meta = json.load(open(f"{src}/anny_model.json"))
blob = open(f"{src}/anny_model.bin", "rb").read()

def load(name, code):
    a = meta["arrays"][name]
    arr = array(code)
    arr.frombytes(blob[a["offset"]:a["offset"] + a["bytes"]])
    return arr, a["shape"]

V, vs = load("rest_vertices", "f"); F, fs = load("faces", "i")
W, ws = load("bone_weights", "f"); B, _ = load("bone_indices", "i")
nv, nf, k = vs[0], fs[0], ws[1]
labels = meta["bone_labels"]
px = [V[i*3] for i in range(nv)]; py = [V[i*3+1] for i in range(nv)]; pz = [V[i*3+2] for i in range(nv)]

dom = []
for i in range(nv):
    best = max(range(k), key=lambda j: W[i*k+j])
    dom.append(labels[B[i*k+best]])

# The exporter already removed the mouth interior, tongue and eye sockets. Drop vertices no face uses any more.
used = set(F)
keep = [i in used for i in range(nv)]
remap, n2 = {}, 0
for i in range(nv):
    if keep[i]: remap[i] = n2; n2 += 1
faces = [(F[f*3], F[f*3+1], F[f*3+2]) for f in range(nf)]
faces = [(remap[a], remap[b], remap[c]) for a, b, c in faces]
px = [px[i] for i in range(nv) if keep[i]]; py = [py[i] for i in range(nv) if keep[i]]; pz = [pz[i] for i in range(nv) if keep[i]]
dom = [dom[i] for i in range(nv) if keep[i]]
nv = n2; nf = len(faces)
F = array("i", [v for t in faces for v in t])

def mean(vals): return sum(vals) / len(vals)
toe = [i for i in range(nv) if dom[i].startswith("toe")]
foot = [i for i in range(nv) if dom[i].startswith("foot")]
sF = 1 if mean([py[i] for i in toe]) - mean([py[i] for i in foot]) > 0 else -1
arm = [i for i in range(nv) if dom[i].startswith("upperarm") and dom[i].endswith(".L")]
sL = 1 if mean([px[i] for i in arm]) > 0 else -1
# new = (sL*x, z, sF*y)
X = [sL * v for v in px]; Y = pz[:]; Z = [sF * v for v in py]
det = -sL * sF
ymin, ymax = min(Y), max(Y); H = ymax - ymin
s = 3.6 / (float(sys.argv[3]) if len(sys.argv) > 3 else H)
cx = (min(X) + max(X)) / 2; cz = (min(Z) + max(Z)) / 2
X = [(v - cx) * s for v in X]; Z = [(v - cz) * s for v in Z]; Y = [(v - ymin) * s - 1.8 for v in Y]

REG = ["head", "neck", "chest", "abdomen", "pelvis", "arm", "forearm", "hand", "leg", "foot"]
def region(label, yn):
    b = label.split(".")[0]
    if b.startswith("neck"): return "neck"
    if b.startswith("head") or b.startswith("jaw"): return "head"
    if b.startswith(("upperarm", "shoulder")): return "arm"
    if b.startswith("lowerarm"): return "forearm"
    if b.startswith(("wrist", "finger", "metacarpal")): return "hand"
    if b.startswith(("upperleg", "lowerleg")): return "leg"
    if b.startswith(("foot", "toe")): return "foot"
    if b.startswith("pelvis"): return "pelvis"
    if yn > 0.86 and not b.startswith(("spine", "clavicle", "breast", "root")): return "head"
    return "chest" if yn >= 0.70 else "abdomen" if yn >= 0.56 else "pelvis"

colors = bytearray()
counts = {}
for i in range(nv):
    yn = (Y[i] + 1.8) / 3.6
    r = region(dom[i], yn); counts[r] = counts.get(r, 0) + 1
    side = 1 if dom[i].endswith(".L") else 2 if dom[i].endswith(".R") else 0
    if r in ("head", "neck", "chest", "abdomen", "pelvis"): side = 0
    colors += bytes([REG.index(r), side, 0, 0])

tri = []
for f in range(nf):
    a, b, c = F[f*3], F[f*3+1], F[f*3+2]
    tri += [a, c, b] if det < 0 else [a, b, c]

nx = [0.0] * nv; ny = [0.0] * nv; nz = [0.0] * nv
for f in range(0, len(tri), 3):
    a, b, c = tri[f], tri[f+1], tri[f+2]
    ux, uy, uz = X[b]-X[a], Y[b]-Y[a], Z[b]-Z[a]
    vx, vy, vz = X[c]-X[a], Y[c]-Y[a], Z[c]-Z[a]
    cx_, cy_, cz_ = uy*vz-uz*vy, uz*vx-ux*vz, ux*vy-uy*vx
    for i in (a, b, c): nx[i] += cx_; ny[i] += cy_; nz[i] += cz_
for i in range(nv):
    l = math.sqrt(nx[i]**2 + ny[i]**2 + nz[i]**2) or 1.0
    nx[i] /= l; ny[i] /= l; nz[i] /= l

pos = array("f"); nor = array("f")
for i in range(nv): pos.extend((X[i], Y[i], Z[i])); nor.extend((nx[i], ny[i], nz[i]))
idx = array("H", tri)
parts = [pos.tobytes(), nor.tobytes(), bytes(colors), idx.tobytes()]
offs = []; o = 0
for p in parts: offs.append(o); o += len(p)
bin_ = b"".join(parts)
gltf = {
  "asset": {"version": "2.0", "generator": "tools/make_body_glb.py"},
  "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0, "name": "body"}],
  "meshes": [{"primitives": [{"attributes": {"POSITION": 0, "NORMAL": 1, "COLOR_0": 2}, "indices": 3, "mode": 4}]}],
  "accessors": [
    {"bufferView": 0, "componentType": 5126, "count": nv, "type": "VEC3", "min": [min(X), min(Y), min(Z)], "max": [max(X), max(Y), max(Z)]},
    {"bufferView": 1, "componentType": 5126, "count": nv, "type": "VEC3"},
    {"bufferView": 2, "componentType": 5121, "normalized": True, "count": nv, "type": "VEC4"},
    {"bufferView": 3, "componentType": 5123, "count": len(tri), "type": "SCALAR"}],
  "bufferViews": [
    {"buffer": 0, "byteOffset": offs[0], "byteLength": len(parts[0]), "target": 34962},
    {"buffer": 0, "byteOffset": offs[1], "byteLength": len(parts[1]), "target": 34962},
    {"buffer": 0, "byteOffset": offs[2], "byteLength": len(parts[2]), "target": 34962},
    {"buffer": 0, "byteOffset": offs[3], "byteLength": len(parts[3]), "target": 34963}],
  "buffers": [{"byteLength": len(bin_)}],
}
js = json.dumps(gltf, separators=(",", ":")).encode()
js += b" " * (-len(js) % 4); bin_ += b"\0" * (-len(bin_) % 4)
glb = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_))
glb += struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(bin_), 0x004E4942) + bin_
open(out, "wb").write(glb)
print("verts", nv, "tris", nf, "facing sF", sF, "left sL", sL, "det", det, "bytes", len(glb))
print("regions", counts, "REG order", REG)
