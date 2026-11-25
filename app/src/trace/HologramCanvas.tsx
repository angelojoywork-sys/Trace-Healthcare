import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Pick3D } from "./areas";

export type BodyView = "female" | "male" | "neutral";
export type Focus = { point: [number, number, number]; normal: [number, number, number] };

// Region ids baked into the GLB (COLOR_0.r) by tools/make_body_glb.py. Side is COLOR_0.g (1 = left, 2 = right).
const REGIONS = ["head", "neck", "chest", "abdomen", "pelvis", "arm", "forearm", "hand", "leg", "foot"] as const;

function areaFor(region: string, side: string, nz: number): string {
  const back = nz < -0.25;
  switch (region) {
    case "head": return back ? "Back of head" : "Face";
    case "neck": return back ? "Back of neck" : "Throat";
    case "chest": return back ? "Upper back" : "Chest";
    case "abdomen": return back ? "Lower back" : "Stomach";
    case "pelvis": return "Hip";
    case "arm": case "forearm": return `${side} arm`;
    case "hand": return `${side} hand`;
    case "leg": return `${side} leg`;
    case "foot": return `${side} foot`;
    default: return "Body";
  }
}

const VERT = /* glsl */ `
varying vec3 vW; varying vec3 vN; varying vec3 vV;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(normalMatrix * normal);
  vec4 mv = viewMatrix * wp;
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

// Hologram look: fine contour lines, glowing rim, slow scan sweep, and glowing lines that wrap the surface around a tap.
const FRAG = /* glsl */ `
uniform float uTime; uniform vec3 uColor;
uniform vec3 uTap; uniform vec3 uTapT; uniform float uTapR;
varying vec3 vW; varying vec3 vN; varying vec3 vV;

float contour(float v, float freq, float width){
  float x = v * freq;
  float d = abs(fract(x) - 0.5) * 2.0;
  float aa = fwidth(x) * 1.2;
  float line = 1.0 - smoothstep(width - aa, width + aa, d);
  return line * (1.0 - smoothstep(0.35, 0.9, fwidth(x) * 2.0)); // fade out before lines alias
}

void main(){
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float lines = contour(vW.y, 58.0, 0.40);
  float sweepY = mod(uTime * 0.7, 5.0) - 2.5;
  float sweep = exp(-pow((vW.y - sweepY) * 5.0, 2.0));

  float tap = 0.0;
  if (uTapR > 0.0) {
    float dist = distance(vW, uTap);
    float fall = 1.0 - smoothstep(uTapR * 0.65, uTapR, dist);
    float ring = 1.0 - smoothstep(0.0, 0.014, abs(vW.y - uTap.y));
    float mer  = 1.0 - smoothstep(0.0, 0.014, abs(dot(vW - uTap, uTapT)));
    float halo = (1.0 - smoothstep(0.0, 0.07, abs(vW.y - uTap.y))) * 0.18 + (1.0 - smoothstep(0.0, 0.07, abs(dot(vW - uTap, uTapT)))) * 0.18;
    float pulse = 0.85 + 0.15 * sin(uTime * 6.0);
    tap = (ring + mer + halo) * fall * pulse;
  }

  vec3 col = uColor * (0.04 + lines * (0.5 + 1.1 * f) + f * 0.55 + sweep * (0.25 + lines * 0.6) + tap * 2.4);
  float a = clamp(0.10 + f * 0.8 + lines * 0.5 + sweep * 0.3 + tap, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}`;

const HOME_POS = new THREE.Vector3(0, 0.2, 7.8);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);
const FOCUS_OFFSET = new THREE.Vector3(0, -0.4, 0);

type Controls = ElementRef<typeof OrbitControls>;

function Rig({ focus, controls }: { focus: Focus | null; controls: React.RefObject<Controls> }) {
  const animating = useRef(false);
  useEffect(() => { animating.current = true; }, [focus]);
  useFrame(({ camera }, dt) => {
    const c = controls.current;
    if (!c || !animating.current) return;
    const k = 1 - Math.exp(-6 * Math.min(dt, 0.05));
    // Aim a little below the tapped point so it sits in the upper half, clear of the note panel.
    const tp = focus ? new THREE.Vector3(...focus.point).add(FOCUS_OFFSET) : HOME_TARGET;
    const cp = focus ? new THREE.Vector3(...focus.point).add(new THREE.Vector3(...focus.normal).normalize().multiplyScalar(2.6)).add(FOCUS_OFFSET) : HOME_POS;
    camera.position.lerp(cp, k);
    c.target.lerp(tp, k);
    c.update();
    if (!focus && camera.position.distanceTo(cp) < 0.01 && c.target.distanceTo(tp) < 0.01) animating.current = false;
  });
  return null;
}

function Body({ view, focus, onPick }: { view: BodyView; focus: Focus | null; onPick: (p: Pick3D) => void }) {
  const { nodes } = useGLTF(`/models/body-${view}.glb`);
  const geometry = useMemo(() => (Object.values(nodes).find((o) => (o as THREE.Mesh).isMesh) as THREE.Mesh).geometry, [nodes]);
  const group = useRef<THREE.Group>(null);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#64ffda") },
        uTap: { value: new THREE.Vector3() },
        uTapT: { value: new THREE.Vector3(1, 0, 0) },
        uTapR: { value: 0 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);

  useEffect(() => {
    if (!focus) return;
    const [nx, , nz] = focus.normal;
    const h = Math.hypot(nx, nz);
    const hx = h > 0.2 ? nx / h : 0, hz = h > 0.2 ? nz / h : 1;
    mat.uniforms.uTap.value.set(...focus.point);
    mat.uniforms.uTapT.value.set(hz, 0, -hx); // horizontal tangent: the vertical line runs along the surface through the tap
  }, [focus, mat]);

  useFrame(({ clock }, dt) => {
    const u = mat.uniforms;
    u.uTime.value = clock.elapsedTime;
    const target = focus ? 1.9 : 0;
    u.uTapR.value += (target - u.uTapR.value) * (1 - Math.exp(-4 * Math.min(dt, 0.05)));
    if (u.uTapR.value < 0.01) u.uTapR.value = 0;
    if (group.current) group.current.position.y = focus ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.04;
  });

  const handle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6 || !e.face) return; // a drag, not a tap
    const col = geometry.getAttribute("color");
    const arr = col.array as Uint8Array;
    const region = REGIONS[arr[e.face.a * 4]] ?? "head";
    const side = arr[e.face.a * 4 + 1] === 1 ? "Left" : arr[e.face.a * 4 + 1] === 2 ? "Right" : "";
    const n = e.face.normal.clone().transformDirection(e.object.matrixWorld);
    onPick({
      area: areaFor(region, side, n.z),
      point: [e.point.x, e.point.y, e.point.z],
      normal: [n.x, n.y, n.z],
      x: Math.round(e.nativeEvent.offsetX),
      y: Math.round(e.nativeEvent.offsetY),
    });
  };

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={mat} onClick={handle} />
    </group>
  );
}

function Base() {
  return (
    <group position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><ringGeometry args={[0.8, 0.82, 96]} /><meshBasicMaterial color="#64ffda" transparent opacity={0.8} /></mesh>
      <mesh><ringGeometry args={[1.15, 1.16, 96]} /><meshBasicMaterial color="#64ffda" transparent opacity={0.35} /></mesh>
    </group>
  );
}

type Props = { view?: BodyView; focus: Focus | null; onPick: (p: Pick3D) => void; onFail: () => void };

export default function HologramCanvas({ view = "neutral", focus, onPick, onFail }: Props) {
  const controls = useRef<Controls>(null);
  const [auto, setAuto] = useState(true);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: HOME_POS.toArray(), fov: 38 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (ev) => { ev.preventDefault(); onFail(); });
      }}
      aria-label="3D body. Drag to turn, tap a spot to log a symptom."
    >
      <color attach="background" args={["#212121"]} />
      <Suspense fallback={null}>
        <Body view={view} focus={focus} onPick={onPick} />
      </Suspense>
      <Base />
      {focus && (
        <mesh position={focus.point}><sphereGeometry args={[0.018, 12, 12]} /><meshBasicMaterial color="#64ffda" /></mesh>
      )}
      <OrbitControls
        ref={controls}
        makeDefault
        enabled={!focus}
        enablePan={false}
        enableZoom={false}
        enableDamping
        minPolarAngle={1.0}
        maxPolarAngle={2.1}
        autoRotate={auto && !focus}
        autoRotateSpeed={1.2}
        onStart={() => setAuto(false)}
      />
      <Rig focus={focus} controls={controls} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={1.4} luminanceThreshold={0.12} luminanceSmoothing={0.2} radius={0.7} />
      </EffectComposer>
    </Canvas>
  );
}

useGLTF.preload("/models/body-neutral.glb");
