"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Line, Float } from "@react-three/drei";
import * as THREE from "three";

/* ───────────────────────── DATA ───────────────────────── */

const articles = [
  { date: "1 oct. 2025", title: "Introduction", learning: "Choix du sujet, premières intuitions sur l'importance de la typographie", y: 0.05 },
  { date: "14 oct. 2025", title: "L'origine de la typographie", learning: "Étymologie, définition, la double nature du mot", y: 0.12 },
  { date: "27 oct. 2025", title: "L'imprimerie et la transmission", learning: "De la xylographie chinoise à Gutenberg", y: 0.22 },
  { date: "9 nov. 2025", title: "Les premiers typographes", learning: "Jenson, Manuce, Griffo, Tory, la rupture avec le gothique", y: 0.30 },
  { date: "22 nov. 2025", title: "Claude Garamont", learning: "Le contexte parisien des années 1530, les Grecs du Roi", y: 0.38 },
  { date: "5 déc. 2025", title: "La standardisation", learning: "Moxon, le Romain du Roi, Fournier, Bodoni", y: 0.45 },
  { date: "18 déc. 2025", title: "La classification typographique", learning: "Vox-ATypI, les onze familles", y: 0.55 },
  { date: "31 déc. 2025", title: "Le dessin typographique", learning: "Anatomie des lettres, vocabulaire technique", y: 0.62 },
  { date: "12 jan. 2026", title: "La typographie sur internet", learning: "PostScript, TrueType, OpenType, @font-face, Google Fonts", y: 0.70 },
  { date: "23 jan. 2026", title: "Les fonderies modernes", learning: "Monotype, les indépendants, le coût de création", y: 0.76 },
  { date: "3 fév. 2026", title: "Licences typographiques", learning: "Desktop, web, app, modèles de tarification", y: 0.80 },
  { date: "13 fév. 2026", title: "Cocotte", learning: "Développement du logiciel en parallèle", y: 0.85 },
  { date: "22 fév. 2026", title: "L'association de polices", learning: "Principes de contraste et de cohérence", y: 0.89 },
  { date: "1 mars 2026", title: "Typographie et identité de marque", learning: "Polices sur-mesure, IBM Plex, Parisine", y: 0.93 },
  { date: "8 mars 2026", title: "OpenType", learning: "Ligatures, petites capitales, chiffres elzéviriens", y: 0.96 },
  { date: "15 mars 2026", title: "Conclusion", learning: "Bilan de l'apprentissage", y: 1.0 },
];

const SPREAD_X = 14;
const HEIGHT = 5;
const DEPTH = 3;

function getPoint(i: number): [number, number, number] {
  const t = i / (articles.length - 1);
  const x = (t - 0.5) * SPREAD_X;
  const y = articles[i].y * HEIGHT;
  const z = Math.sin(t * Math.PI) * DEPTH;
  return [x, y, z];
}

/* ───────────────────── CURVE RIBBON ───────────────────── */

function CurveRibbon() {
  const curvePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < articles.length; i++) {
      pts.push(new THREE.Vector3(...getPoint(i)));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.3);
    return curve.getPoints(200);
  }, []);

  const linePoints = useMemo(
    () => curvePoints.map((p) => [p.x, p.y, p.z] as [number, number, number]),
    [curvePoints]
  );

  return (
    <>
      {/* Main curve */}
      <Line
        points={linePoints}
        color="#1d1d1f"
        lineWidth={2}
        transparent
        opacity={0.9}
      />
      {/* Shadow curve on ground plane */}
      <Line
        points={linePoints.map(([x, , z]) => [x, 0, z] as [number, number, number])}
        color="#1d1d1f"
        lineWidth={1}
        transparent
        opacity={0.06}
      />
      {/* Vertical drop lines from curve to ground */}
      {articles.map((_, i) => {
        const [x, y, z] = getPoint(i);
        return (
          <Line
            key={`drop-${i}`}
            points={[
              [x, y, z],
              [x, 0, z],
            ]}
            color="#1d1d1f"
            lineWidth={0.5}
            transparent
            opacity={0.04}
          />
        );
      })}
    </>
  );
}

/* ───────────────────── DATA POINT ───────────────────── */

function DataPoint({
  index,
  isActive,
  onHover,
}: {
  index: number;
  isActive: boolean;
  onHover: (i: number | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [x, y, z] = getPoint(index);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = isActive ? 0.18 : 0.08;
    meshRef.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      0.15
    );
  });

  return (
    <group position={[x, y, z]}>
      {/* Hit area */}
      <mesh
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(index);
        }}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visible sphere */}
      <mesh ref={meshRef} scale={0.08}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? "#1d1d1f" : "#86868b"}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Ring on active */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.26, 32]} />
          <meshBasicMaterial
            color="#1d1d1f"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Number label */}
      <Text
        position={[0, -0.35, 0]}
        fontSize={0.15}
        color={isActive ? "#1d1d1f" : "#d2d2d7"}
        anchorX="center"
        anchorY="top"
        font="/fonts/inter-medium.woff"
      >
        {String(index + 1).padStart(2, "0")}
      </Text>
    </group>
  );
}

/* ───────────────────── FLOATING LABEL ───────────────────── */

function ActiveLabel({ index }: { index: number }) {
  const [x, y, z] = getPoint(index);
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={[x, y + 0.55, z]} ref={groupRef}>
      <Text
        fontSize={0.2}
        color="#1d1d1f"
        anchorX="center"
        anchorY="bottom"
        maxWidth={3}
        textAlign="center"
        font="/fonts/inter-medium.woff"
      >
        {articles[index].title}
      </Text>
    </group>
  );
}

/* ───────────────────── GROUND GRID ───────────────────── */

function Ground() {
  return (
    <group position={[0, -0.01, 0]}>
      <gridHelper
        args={[20, 20, "#e8e8ed", "#e8e8ed"]}
        rotation={[0, 0, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#fbfbfd"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

/* ───────────────────── MONTH MARKERS ───────────────────── */

function MonthMarkers() {
  const monthLabels = [
    { label: "Oct.", idx: 0 },
    { label: "Nov.", idx: 3 },
    { label: "Déc.", idx: 6 },
    { label: "Jan.", idx: 8 },
    { label: "Fév.", idx: 10 },
    { label: "Mars", idx: 13 },
  ];

  return (
    <>
      {monthLabels.map((m) => {
        const [x, , z] = getPoint(m.idx);
        return (
          <Text
            key={m.label}
            position={[x, 0.02, z + 0.8]}
            fontSize={0.2}
            color="#86868b"
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]}
            font="/fonts/inter-medium.woff"
          >
            {m.label}
          </Text>
        );
      })}
    </>
  );
}

/* ───────────────────── GENTLE AUTO-ROTATE ───────────────────── */

function AutoRotate({ enabled }: { enabled: boolean }) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  useFrame(() => {
    if (controlsRef.current && enabled) {
      controlsRef.current.autoRotateSpeed = 0.3;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={enabled}
      autoRotateSpeed={0.3}
      enableZoom={true}
      enablePan={false}
      minDistance={5}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={0.3}
      target={[0, 2, 0]}
    />
  );
}

/* ───────────────────── SCENE ───────────────────── */

function Scene({
  active,
  onHover,
}: {
  active: number | null;
  onHover: (i: number | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 12, 5]} intensity={0.6} />

      <Ground />
      <CurveRibbon />
      <MonthMarkers />

      {articles.map((_, i) => (
        <DataPoint
          key={i}
          index={i}
          isActive={active === i}
          onHover={onHover}
        />
      ))}

      {active !== null && (
        <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
          <ActiveLabel index={active} />
        </Float>
      )}

      <AutoRotate enabled={active === null} />
      <fog attach="fog" args={["#fbfbfd", 15, 30]} />
    </>
  );
}

/* ───────────────────── MAIN COMPONENT ───────────────────── */

export default function LearningCurve3D() {
  const [active, setActive] = useState<number | null>(null);

  const handleHover = useCallback((i: number | null) => {
    setActive(i);
  }, []);

  return (
    <div className="w-screen h-screen relative left-1/2 -translate-x-1/2 flex flex-col bg-[var(--bg)]">

      {/* Top bar */}
      <div className="flex items-baseline justify-between px-8 pt-6 pb-2 z-10">
        <div>
          <h3 className="text-xl font-semibold text-[var(--black)] tracking-tight">
            Courbe d&apos;apprentissage
          </h3>
          <p className="text-[13px] text-[var(--light)] mt-0.5">
            16 articles &middot; Oct. 2025 — Mars 2026
          </p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 min-h-0">
        <Canvas
          camera={{ position: [0, 5, 12], fov: 45 }}
          dpr={[1, 2]}
          style={{ background: "transparent" }}
          onPointerMissed={() => setActive(null)}
        >
          <Scene active={active} onHover={handleHover} />
        </Canvas>
      </div>

      {/* Bottom detail card */}
      <div className="px-8 pb-6 z-10">
        <div
          className="max-w-[600px] mx-auto rounded-xl"
          style={{
            transition: "all 300ms ease-out",
            backgroundColor: active !== null ? "#f5f5f7" : "transparent",
            padding: "16px 20px",
            opacity: active !== null ? 1 : 0,
            transform: active !== null ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {active !== null && (
            <div className="flex items-start gap-4">
              <span className="text-2xl font-semibold text-[var(--lighter)] tabular-nums leading-none mt-0.5">
                {String(active + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[15px] font-semibold text-[var(--black)] leading-snug">
                    {articles[active].title}
                  </p>
                  <p className="text-xs text-[var(--light)] tabular-nums shrink-0">
                    {articles[active].date}
                  </p>
                </div>
                <p className="text-[13px] text-[var(--mid)] leading-relaxed mt-1">
                  {articles[active].learning}
                </p>
              </div>
            </div>
          )}
        </div>
        {active === null && (
          <p className="text-center text-xs text-[var(--lighter)]">
            Survolez les points ou faites tourner la vue
          </p>
        )}
      </div>
    </div>
  );
}
