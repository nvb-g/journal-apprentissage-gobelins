"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/* ──────────────── DATA ──────────────── */

const articles = [
  { date: "Oct. 2025", title: "Introduction", y: 0.05 },
  { date: "", title: "L'origine de la typographie", y: 0.12 },
  { date: "", title: "L'imprimerie et la transmission", y: 0.22 },
  { date: "Nov.", title: "Les premiers typographes", y: 0.30 },
  { date: "", title: "Claude Garamont", y: 0.38 },
  { date: "", title: "La standardisation", y: 0.45 },
  { date: "Déc.", title: "La classification typographique", y: 0.55 },
  { date: "", title: "Le dessin typographique", y: 0.62 },
  { date: "Jan. 2026", title: "La typographie sur internet", y: 0.70 },
  { date: "", title: "Les fonderies modernes", y: 0.76 },
  { date: "Fév.", title: "Licences typographiques", y: 0.80 },
  { date: "", title: "Cocotte", y: 0.85 },
  { date: "", title: "L'association de polices", y: 0.89 },
  { date: "Mars", title: "Typographie et identité", y: 0.93 },
  { date: "", title: "OpenType", y: 0.96 },
  { date: "", title: "Conclusion", y: 1.0 },
];

const N = articles.length;
const HELIX_REVS = 2.5;
const HELIX_R = 3;
const HELIX_H = 8;

function helixPoint(t: number): THREE.Vector3 {
  const angle = t * Math.PI * 2 * HELIX_REVS;
  return new THREE.Vector3(
    Math.cos(angle) * HELIX_R,
    t * HELIX_H,
    Math.sin(angle) * HELIX_R
  );
}

/* ──────────────── AMBIENT PARTICLES ──────────────── */

function Particles({ count = 4000 }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = Math.random() * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#666"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

/* ──────────────── HELIX TUBE ──────────────── */

function HelixTube() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 300; i++) {
      pts.push(helixPoint(i / 300));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, 300, 0.025, 8, false);
  }, []);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color="#1d1d1f"
        roughness={0.4}
        metalness={0.6}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

/* ──────────────── HELIX GLOW (thicker, emissive) ──────────────── */

function HelixGlow() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 300; i++) {
      pts.push(helixPoint(i / 300));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, 300, 0.06, 8, false);
  }, []);

  return (
    <mesh geometry={geom}>
      <meshBasicMaterial
        color="#888"
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

/* ──────────────── DATA NODE ──────────────── */

function DataNode({
  index,
  active,
  onHover,
}: {
  index: number;
  active: boolean;
  onHover: (i: number | null) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const t = index / (N - 1);
  const pos = helixPoint(t);

  useFrame(() => {
    if (!ref.current) return;
    const s = active ? 1.4 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
  });

  return (
    <group ref={ref} position={pos}>
      {/* Hit area */}
      <mesh
        onPointerEnter={(e) => { e.stopPropagation(); onHover(index); }}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#fff" : "#999"}
          emissive={active ? "#fff" : "#333"}
          emissiveIntensity={active ? 2 : 0.1}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Outer ring on hover */}
      {active && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.16, 32]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ──────────────── FLOATING LABEL (always faces camera) ──────────────── */

function ActiveLabel({ index }: { index: number }) {
  const t = index / (N - 1);
  const pos = helixPoint(t);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <Float speed={3} rotationIntensity={0} floatIntensity={0.15}>
      <group ref={groupRef} position={[pos.x, pos.y + 0.45, pos.z]}>
        <Text
          fontSize={0.18}
          color="#fff"
          anchorX="center"
          anchorY="bottom"
          maxWidth={3}
          textAlign="center"
          font="/fonts/inter-medium.woff"
          outlineWidth={0.01}
          outlineColor="#000"
        >
          {articles[index].title}
        </Text>
        {articles[index].date && (
          <Text
            fontSize={0.1}
            color="#888"
            anchorX="center"
            anchorY="top"
            position={[0, -0.08, 0]}
            font="/fonts/inter-medium.woff"
          >
            {articles[index].date}
          </Text>
        )}
      </group>
    </Float>
  );
}

/* ──────────────── VERTICAL DROPLINES ──────────────── */

function DropLines() {
  const lines = useMemo(() => {
    return articles.map((_, i) => {
      const t = i / (N - 1);
      const p = helixPoint(t);
      return [
        new THREE.Vector3(p.x, p.y, p.z),
        new THREE.Vector3(p.x, 0, p.z),
      ];
    });
  }, []);

  return (
    <>
      {lines.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([
                pts[0].x, pts[0].y, pts[0].z,
                pts[1].x, pts[1].y, pts[1].z,
              ]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#555" transparent opacity={0.06} />
        </line>
      ))}
    </>
  );
}

/* ──────────────── GROUND ──────────────── */

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial
          color="#111"
          roughness={1}
          metalness={0}
          transparent
          opacity={0.3}
        />
      </mesh>
      <gridHelper
        args={[24, 24, "#222", "#1a1a1a"]}
        position={[0, 0, 0]}
      />
    </>
  );
}

/* ──────────────── CAMERA RIG ──────────────── */

function CameraRig({ active }: { active: number | null }) {
  return (
    <OrbitControls
      autoRotate={active === null}
      autoRotateSpeed={0.4}
      enableZoom
      enablePan={false}
      minDistance={5}
      maxDistance={18}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0.3}
      target={[0, HELIX_H * 0.45, 0]}
      dampingFactor={0.05}
      enableDamping
    />
  );
}

/* ──────────────── SCENE ──────────────── */

function Scene({
  active,
  onHover,
}: {
  active: number | null;
  onHover: (i: number | null) => void;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} color="#fff" />
      <pointLight position={[-5, 8, -3]} intensity={0.3} color="#aac" />

      {/* Environment */}
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", 12, 25]} />

      <Ground />
      <Particles />
      <HelixTube />
      <HelixGlow />
      <DropLines />

      {articles.map((_, i) => (
        <DataNode key={i} index={i} active={active === i} onHover={onHover} />
      ))}

      {active !== null && <ActiveLabel index={active} />}

      <CameraRig active={active} />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.001, 0.001)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    </>
  );
}

/* ──────────────── MAIN ──────────────── */

export default function LearningCurve3D() {
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const handleHover = useCallback((i: number | null) => setActive(i), []);

  if (!ready) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 50,
        background: "#0a0a0a",
      }}
    >
      {/* Canvas */}
      <Canvas
        camera={{ position: [6, 5, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        style={{ position: "absolute", inset: 0 }}
        onPointerMissed={() => setActive(null)}
      >
        <Scene active={active} onHover={handleHover} />
      </Canvas>

      {/* Overlay: title */}
      <div style={{ position: "absolute", top: 32, left: 32, zIndex: 10 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          Courbe d&apos;apprentissage
        </h3>
        <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
          16 articles &middot; Oct. 2025 — Mars 2026
        </p>
      </div>

      {/* Overlay: article counter */}
      {active !== null && (
        <div style={{ position: "absolute", top: 32, right: 32, zIndex: 10, textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#555", margin: 0, fontVariantNumeric: "tabular-nums" }}>
            {String(active + 1).padStart(2, "0")}/{N}
          </p>
        </div>
      )}

      {/* Overlay: detail card */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: `translateX(-50%) translateY(${active !== null ? 0 : 12}px)`,
          transition: "all 300ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          opacity: active !== null ? 1 : 0,
          zIndex: 10,
          width: "100%",
          maxWidth: 480,
          padding: "0 24px",
          pointerEvents: "none",
        }}
      >
        {active !== null && (
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "16px 20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.3 }}>
                {articles[active].title}
              </p>
              {articles[active].date && (
                <p style={{ fontSize: 11, color: "#666", margin: 0, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                  {articles[active].date}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {active === null && (
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <p style={{ fontSize: 12, color: "#444", margin: 0 }}>
            Survolez les points &middot; Glissez pour tourner
          </p>
        </div>
      )}
    </div>
  );
}
