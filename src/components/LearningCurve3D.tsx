"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
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
const HELIX_R = 2.6;
const HELIX_H = 7;

function helixPt(t: number): THREE.Vector3 {
  const a = t * Math.PI * 2 * HELIX_REVS;
  return new THREE.Vector3(Math.cos(a) * HELIX_R, t * HELIX_H, Math.sin(a) * HELIX_R);
}

/* ──────────── PARTICLES ──────────── */

function Particles({ count = 2000 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 20;
      a[i * 3 + 1] = Math.random() * 10;
      a[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return a;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.006;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.01} color="#aaa" transparent opacity={0.2} sizeAttenuation />
    </points>
  );
}

/* ──────────── HELIX TUBE ──────────── */

function Helix() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 400; i++) pts.push(helixPt(i / 400));
    const c = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(c, 400, 0.015, 8, false);
  }, []);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#333" roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

/* ──────────── NODE WITH LABEL ──────────── */

function Node({
  index,
  active,
  onHover,
}: {
  index: number;
  active: boolean;
  onHover: (i: number | null) => void;
}) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const pos = helixPt(index / (N - 1));

  useFrame(() => {
    if (!sphereRef.current) return;
    const s = active ? 0.12 : 0.045;
    sphereRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  return (
    <group position={pos}>
      {/* Hit area */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover(index); }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.45, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Sphere */}
      <mesh ref={sphereRef} scale={0.045}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#fff" : "#888"}
          emissive={active ? "#fff" : "#333"}
          emissiveIntensity={active ? 2 : 0.02}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* HTML label — always visible, highlighted on hover */}
      <Html
        position={[0.3, 0.15, 0]}
        style={{
          pointerEvents: "none",
          whiteSpace: "nowrap",
          userSelect: "none",
          transition: "opacity 200ms ease-out",
        }}
        distanceFactor={8}
        occlude={false}
        zIndexRange={[1, 0]}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: active ? 600 : 400,
            color: active ? "#1d1d1f" : "#aaa",
            fontFamily: "inherit",
            transition: "all 200ms ease-out",
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 9, color: active ? "#86868b" : "#ccc", fontVariantNumeric: "tabular-nums" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          {articles[index].title}
        </span>
      </Html>
    </group>
  );
}

/* ──────────── SCROLL BLOCKER ──────────── */

function ScrollBlocker() {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const block = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    canvas.addEventListener("wheel", block, { passive: false });
    return () => canvas.removeEventListener("wheel", block);
  }, [gl]);

  return null;
}

/* ──────────── SCENE ──────────── */

function Scene({
  active,
  onHover,
}: {
  active: number | null;
  onHover: (i: number | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} />
      <pointLight position={[-4, 8, -4]} intensity={0.2} color="#dde" />

      <fog attach="fog" args={["#fbfbfd", 18, 35]} />

      <Particles />
      <Helix />

      {articles.map((_, i) => (
        <Node key={i} index={i} active={active === i} onHover={onHover} />
      ))}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.2}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        target={[0, HELIX_H * 0.45, 0]}
      />

      <ScrollBlocker />

      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.85} luminanceSmoothing={0.9} mipmapBlur />
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
        minHeight: 500,
        maxHeight: 700,
        position: "relative",
        marginTop: 48,
        marginBottom: 48,
        cursor: "grab",
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      <Canvas
        camera={{ position: [6, 4.5, 7], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          alpha: true,
        }}
        style={{
          position: "absolute",
          inset: 0,
          touchAction: "none",
        }}
        onPointerMissed={() => setActive(null)}
      >
        <Scene active={active} onHover={handleHover} />
      </Canvas>
    </div>
  );
}
