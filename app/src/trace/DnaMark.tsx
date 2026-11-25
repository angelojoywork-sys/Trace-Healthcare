import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const H = 4.2, RAD = 0.55, TURNS = 2.2;
const TEAL = new THREE.Color("#64ffda");
const AMBER = new THREE.Color("#ffb74d"); // MUI orange 300

class Helix extends THREE.Curve<THREE.Vector3> {
  constructor(private phase: number) { super(); }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = this.phase + t * TURNS * 2 * Math.PI;
    return target.set(RAD * Math.cos(a), (t - 0.5) * H, RAD * Math.sin(a));
  }
}

function gradientColors(geo: THREE.BufferGeometry) {
  const pos = geo.getAttribute("position");
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    c.copy(TEAL).lerp(AMBER, Math.min(1, Math.max(0, (pos.getY(i) + H / 2) / H)));
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
}

function Strands({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { strands, rungs } = useMemo(() => {
    const a = new Helix(0), b = new Helix(Math.PI);
    const strands = [a, b].map((curve) => {
      const g = new THREE.TubeGeometry(curve, 260, 0.085, 16, false);
      gradientColors(g);
      return g;
    });
    const rungs = Array.from({ length: 22 }, (_, k) => {
      const t = 0.03 + (k / 21) * 0.94;
      const p1 = a.getPoint(t), p2 = b.getPoint(t);
      const dir = p2.clone().sub(p1);
      const g = new THREE.CylinderGeometry(0.034, 0.034, dir.length(), 10);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      const color = TEAL.clone().lerp(AMBER, t);
      return { g, pos: p1.clone().add(p2).multiplyScalar(0.5), q, color };
    });
    return { strands, rungs };
  }, []);
  useEffect(() => () => { strands.forEach((g) => g.dispose()); rungs.forEach((r) => r.g.dispose()); }, [strands, rungs]);

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15 }), []);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }, dt) => {
    if (!group.current || still) return;
    group.current.rotation.y += Math.min(dt, 0.05) * 0.35;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.06;
  });

  return (
    <group rotation={[0, 0, -0.62]}>
      <group ref={group}>
        {strands.map((g, i) => <mesh key={i} geometry={g} material={mat} />)}
        {rungs.map((r, i) => (
          <mesh key={i} geometry={r.g} position={r.pos} quaternion={r.q}>
            <meshPhysicalMaterial color={r.color} metalness={0.3} roughness={0.25} clearcoat={1} clearcoatRoughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { scene.environment = null; env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
}

/** A glossy double helix in the brand colours: teal at the bottom fading to amber at the top. */
export default function DnaMark({ onFail }: { onFail: () => void }) {
  const alive = useRef(true);
  useLayoutEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.0], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      onCreated={({ gl }) => { gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); if (alive.current) onFail(); }); }}
      aria-hidden="true"
    >
      <Env />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#64ffda" />
      <Strands still={still} />
    </Canvas>
  );
}
