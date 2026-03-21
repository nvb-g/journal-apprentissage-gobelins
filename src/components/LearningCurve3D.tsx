"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/* ──────────── DATA ──────────── */

const articles = [
  { title: "Introduction", y: 0.05 },
  { title: "L'origine de la typographie", y: 0.12 },
  { title: "L'imprimerie et la transmission", y: 0.22 },
  { title: "Les premiers typographes", y: 0.30 },
  { title: "Claude Garamont", y: 0.38 },
  { title: "La standardisation", y: 0.45 },
  { title: "La classification typographique", y: 0.55 },
  { title: "Le dessin typographique", y: 0.62 },
  { title: "La typographie sur internet", y: 0.70 },
  { title: "Les fonderies modernes", y: 0.76 },
  { title: "Licences typographiques", y: 0.80 },
  { title: "Cocotte", y: 0.85 },
  { title: "L'association de polices", y: 0.89 },
  { title: "Typographie et identité", y: 0.93 },
  { title: "OpenType", y: 0.96 },
  { title: "Conclusion", y: 1.0 },
];

const N = articles.length;
const HELIX_REVS = 2.2;
const HELIX_R = 2.8;
const HELIX_H = 7;

function helixPt(t: number): THREE.Vector3 {
  const a = t * Math.PI * 2 * HELIX_REVS;
  return new THREE.Vector3(Math.cos(a) * HELIX_R, t * HELIX_H, Math.sin(a) * HELIX_R);
}

/* ──────────── PARTICLES ──────────── */

function Particles({ count = 3000 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 24;
      a[i * 3 + 1] = Math.random() * 10;
      a[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    return a;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#999" transparent opacity={0.25} sizeAttenuation />
    </points>
  );
}

/* ──────────── HELIX ──────────── */

function Helix() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 400; i++) pts.push(helixPt(i / 400));
    const c = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(c, 400, 0.018, 8, false);
  }, []);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#1d1d1f" roughness={0.3} metalness={0.7} />
    </mesh>
  );
}

/* ──────────── NODE ──────────── */

function Node({ index, active, onHover }: { index: number; active: boolean; onHover: (i: number | null) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const pos = helixPt(index / (N - 1));

  useFrame(() => {
    if (!ref.current) return;
    const s = active ? 0.14 : 0.05;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  return (
    <group position={pos}>
      <mesh onPointerEnter={(e) => { e.stopPropagation(); onHover(index); }} onPointerLeave={() => onHover(null)}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh ref={ref} scale={0.05}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#fff" : "#aaa"}
          emissive={active ? "#fff" : "#444"}
          emissiveIntensity={active ? 1.8 : 0.05}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

/* ──────────── SCENE ──────────── */

function Scene({ active, onHover }: { active: number | null; onHover: (i: number | null) => void }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 10, 5]} intensity={0.4} />
      <pointLight position={[-4, 8, -4]} intensity={0.2} color="#cce" />

      <color attach="background" args={["#fbfbfd"]} />
      <fog attach="fog" args={["#fbfbfd", 14, 28]} />

      <Particles />
      <Helix />

      {articles.map((_, i) => (
        <Node key={i} index={i} active={active === i} onHover={onHover} />
      ))}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.25}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        target={[0, HELIX_H * 0.45, 0]}
      />

      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.8} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette offset={0.35} darkness={0.4} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
}

/* ──────────── EXPORT ──────────── */

export default function LearningCurve3D() {
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const handleHover = useCallback((i: number | null) => setActive(i), []);

  if (!ready) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "70vh",
        position: "relative",
        marginTop: 40,
        marginBottom: 40,
        overflow: "hidden",
        borderRadius: 16,
      }}
    >
      <Canvas
        camera={{ position: [7, 4, 7], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ position: "absolute", inset: 0 }}
        onPointerMissed={() => setActive(null)}
      >
        <Scene active={active} onHover={handleHover} />
      </Canvas>

      {/* Active article overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: `translateX(-50%) translateY(${active !== null ? 0 : 8}px)`,
          transition: "all 250ms ease-out",
          opacity: active !== null ? 1 : 0,
          pointerEvents: "none",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        {active !== null && (
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--black)",
              margin: 0,
              background: "rgba(251,251,253,0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ color: "var(--lighter)", marginRight: 8, fontVariantNumeric: "tabular-nums" }}>
              {String(active + 1).padStart(2, "0")}
            </span>
            {articles[active].title}
          </p>
        )}
      </div>
    </div>
  );
}
