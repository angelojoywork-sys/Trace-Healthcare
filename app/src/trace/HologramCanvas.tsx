import { useEffect, useMemo, useRef, useState, type ElementRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Pick3D } from "./areas";

type Part = {
  k: string;
  region: string;
  side?: "Left" | "Right";
  g: "s" | "c";
  a: number[];
  p: [number, number, number];
  sc?: [number, number, number];
  r?: [number, number, number];
};

// Person's left is +x when they face the camera.
const mirror = (base: Omit<Part, "side">): Part[] => [
  { ...base, k: base.k + "L", side: "Left" },
  { ...base, k: base.k + "R", side: "Right", p: [-base.p[0], base.p[1], base.p[2]], r: base.r ? [base.r[0], base.r[1], -base.r[2]] : undefined },
];

const PARTS: Part[] = [
  { k: "head", region: "head", g: "s", a: [0.24], p: [0, 1.62, 0], sc: [0.92, 1.08, 1] },
  { k: "neck", region: "neck", g: "c", a: [0.085, 0.14], p: [0, 1.33, 0] },
  { k: "chest", region: "chest", g: "c", a: [0.3, 0.38], p: [0, 0.95, 0], sc: [1.25, 1, 0.72] },
  { k: "abdomen", region: "abdomen", g: "c", a: [0.26, 0.3], p: [0, 0.42, 0], sc: [1.1, 1, 0.75] },
  { k: "pelvis", region: "pelvis", g: "s", a: [0.3], p: [0, 0.05, 0], sc: [1.1, 0.75, 0.78] },
  ...mirror({ k: "arm", region: "arm", g: "c", a: [0.085, 0.4], p: [0.5, 0.92, 0], r: [0, 0, 0.1] }),
  ...mirror({ k: "forearm", region: "forearm", g: "c", a: [0.072, 0.38], p: [0.6, 0.42, 0] }),
  ...mirror({ k: "hand", region: "hand", g: "s", a: [0.075], p: [0.63, 0.1, 0] }),
  ...mirror({ k: "thigh", region: "leg", g: "c", a: [0.125, 0.55], p: [0.17, -0.5, 0] }),
  ...mirror({ k: "shin", region: "leg", g: "c", a: [0.095, 0.55], p: [0.17, -1.2, 0] }),
  ...mirror({ k: "foot", region: "foot", g: "s", a: [0.1], p: [0.17, -1.72, 0.08], sc: [1, 0.6, 1.8] }),
];

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
varying vec3 vN; varying vec3 vV; varying float vY;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vY = wp.y;
  vN = normalize(normalMatrix * normal);
  vec4 mv = viewMatrix * wp;
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = /* glsl */ `
uniform float uTime; uniform vec3 uColor;
varying vec3 vN; varying vec3 vV; varying float vY;
void main(){
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
  float scan = 0.5 + 0.5 * sin(vY * 60.0 - uTime * 2.0);
  float a = 0.10 + f * 0.75 + scan * 0.06;
  gl_FragColor = vec4(uColor * (0.6 + f), a);
}`;

const HOME_POS = new THREE.Vector3(0, 0.2, 6.6);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);
const FOCUS_OFFSET = new THREE.Vector3(0, -0.3, 0);
export type Focus = { point: [number, number, number]; normal: [number, number, number] };

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
    const cp = focus ? new THREE.Vector3(...focus.point).add(new THREE.Vector3(...focus.normal).normalize().multiplyScalar(1.5)).add(FOCUS_OFFSET) : HOME_POS;
    camera.position.lerp(cp, k);
    c.target.lerp(tp, k);
    c.update();
    if (!focus && camera.position.distanceTo(cp) < 0.01 && c.target.distanceTo(tp) < 0.01) animating.current = false;
  });
  return null;
}

function Body({ focused, onPick }: { focused: boolean; onPick: (p: Pick3D) => void }) {
  const group = useRef<THREE.Group>(null);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color("#64ffda") } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    if (group.current) group.current.position.y = focused ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.04;
  });
  const handle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6 || !e.face) return; // a drag, not a tap
    const n = e.face.normal.clone().transformDirection(e.object.matrixWorld);
    const { region, side } = e.object.userData as { region: string; side: string };
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
      {PARTS.map((p) => (
        <mesh key={p.k} position={p.p} rotation={p.r} scale={p.sc} material={mat} userData={{ region: p.region, side: p.side ?? "" }} onClick={handle}>
          {p.g === "s" ? <sphereGeometry args={[p.a[0], 24, 16]} /> : <capsuleGeometry args={[p.a[0], p.a[1], 6, 16]} />}
        </mesh>
      ))}
    </group>
  );
}

function Base() {
  return (
    <group position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><ringGeometry args={[0.7, 0.72, 64]} /><meshBasicMaterial color="#64ffda" transparent opacity={0.7} /></mesh>
      <mesh><ringGeometry args={[1.0, 1.01, 64]} /><meshBasicMaterial color="#64ffda" transparent opacity={0.3} /></mesh>
    </group>
  );
}

export default function HologramCanvas({ focus, onPick, onFail }: { focus: Focus | null; onPick: (p: Pick3D) => void; onFail: () => void }) {
  const controls = useRef<Controls>(null);
  const [auto, setAuto] = useState(true);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: HOME_POS.toArray(), fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (ev) => { ev.preventDefault(); onFail(); });
      }}
      aria-label="3D body. Drag to turn, tap a spot to log a symptom."
    >
      <Body focused={!!focus} onPick={onPick} />
      <Base />
      {focus && (
        <group position={focus.point} onUpdate={(g) => g.lookAt(g.position.clone().add(new THREE.Vector3(...focus.normal)))}>
          <mesh><ringGeometry args={[0.06, 0.075, 32]} /><meshBasicMaterial color="#64ffda" side={THREE.DoubleSide} /></mesh>
          <mesh><sphereGeometry args={[0.014, 8, 8]} /><meshBasicMaterial color="#64ffda" /></mesh>
        </group>
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
    </Canvas>
  );
}
