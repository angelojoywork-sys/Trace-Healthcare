"""Export adult female / male / neutral rest meshes from the Anny body model.

Needs:  pip install anny   (Naver, Apache-2.0; pulls in PyTorch, CPU is fine)
Run:    python -I tools/export_anny_bodies.py <out_dir>
Writes <out_dir>/<view>/anny_model.json + anny_model.bin in the same layout as the anny-js package,
so tools/make_body_glb.py can convert each one.
Anny phenotype notes: age 0.667 = young adult; gender 0 = male-typical, 1 = female-typical.
"""
import json, os, sys
import numpy as np
import torch
import anny
from anny.face_segmentation import get_face_segmentation_mask

out_dir = sys.argv[1]
model = anny.Anny(local_changes="default").to(dtype=torch.float32)
pose = torch.eye(4)[None, None].repeat(1, model.bone_count, 1, 1)

BODIES = {
    "male":    dict(gender=0.0, age=0.667, muscle=0.62, weight=0.50),
    "female":  dict(gender=1.0, age=0.667, muscle=0.45, weight=0.45),
    "neutral": dict(gender=0.5, age=0.667, muscle=0.50, weight=0.48),
}

def arr(name, a, dtype):
    a = np.ascontiguousarray(a, dtype=dtype)
    return name, a

for view, params in BODIES.items():
    kw = {k: 0.5 for k in model.phenotype_labels}
    kw.update(params)
    out = model(pose_parameters=pose, phenotype_kwargs=kw)
    verts = out["vertices"].squeeze(0).numpy()
    # Drop the inside of the mouth, the tongue and the eye sockets so the hologram face stays clean.
    inner = get_face_segmentation_mask(model, ["mouth_cavity", "tongue", "eye_cavity.L", "eye_cavity.R", "eye_back.L", "eye_back.R"])
    faces = model.faces[~inner].numpy()
    w = model.vertex_bone_weights.detach().numpy()
    idx = model.vertex_bone_indices.detach().numpy()
    parts, meta, off = [], {}, 0
    for name, a in (arr("rest_vertices", verts, "<f4"), arr("faces", faces, "<i4"), arr("bone_weights", w, "<f4"), arr("bone_indices", idx, "<i4")):
        b = a.tobytes(); parts.append(b)
        meta[name] = {"dtype": a.dtype.str, "shape": list(a.shape), "offset": off, "bytes": len(b)}; off += len(b)
    d = os.path.join(out_dir, view); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "anny_model.bin"), "wb").write(b"".join(parts))
    json.dump({"arrays": meta, "bone_labels": list(model.bone_labels), "params": params}, open(os.path.join(d, "anny_model.json"), "w"))
    h = float(verts[:, 2].max() - verts[:, 2].min())
    print(view, "faces kept", faces.shape[0], "of", int(model.faces.shape[0]), "verts", verts.shape, "height_m", round(h, 3), "weights", w.shape)
