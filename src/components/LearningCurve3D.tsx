"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const titles = [
  "Introduction", "L'origine de la typographie", "L'imprimerie et la transmission",
  "Les premiers typographes", "Claude Garamont", "La standardisation",
  "La classification typographique", "Le dessin typographique",
  "La typographie sur internet", "Les fonderies modernes",
  "Licences typographiques", "Cocotte", "L'association de polices",
  "Typographie et identité", "OpenType", "Conclusion",
];

const N = titles.length;
const REVS = 2.2, R = 2.4, H = 6.5;

function helixPos(i: number): [number, number, number] {
  const t = i / (N - 1);
  const a = t * Math.PI * 2 * REVS;
  return [Math.cos(a) * R, t * H, Math.sin(a) * R];
}

/* ════════ PARTICLE FIELD — 60K points along the helix ════════ */

function ParticleField({ active }: { active: number | null }) {
  const COUNT = 60000;
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const t = Math.random();
      const a = t * Math.PI * 2 * REVS;
      // Spread around helix path with gaussian-ish distribution
      const spread = 0.6 + Math.random() * 2.5;
      const angleOff = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * R + Math.cos(angleOff) * spread * (0.3 + Math.random());
      pos[i * 3 + 1] = t * H + (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = Math.sin(a) * R + Math.sin(angleOff) * spread * (0.3 + Math.random());
      rnd[i] = Math.random();
    }
    return { positions: pos, randoms: rnd };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uActive: { value: -1.0 },
  }), []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
      matRef.current.uniforms.uActive.value = active !== null ? active / (N - 1) : -1.0;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aRandom;
          uniform float uTime;
          uniform float uActive;
          varying float vAlpha;
          varying float vSize;

          void main() {
            vec3 pos = position;

            // Gentle drift
            pos.x += sin(uTime * 0.15 + aRandom * 40.0) * 0.08;
            pos.y += cos(uTime * 0.12 + aRandom * 30.0) * 0.06;
            pos.z += sin(uTime * 0.1 + aRandom * 50.0) * 0.08;

            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            float dist = length(mvPos.xyz);

            // Base size
            float size = (1.5 + aRandom * 2.0) * (1.0 / dist);

            // Brightness near active node
            float alpha = 0.12 + aRandom * 0.08;
            if (uActive >= 0.0) {
              float nodeY = uActive * ${H.toFixed(1)};
              float proximity = 1.0 - smoothstep(0.0, 1.8, abs(pos.y - nodeY));
              alpha += proximity * 0.5;
              size += proximity * 3.0;
            }

            vAlpha = alpha;
            gl_PointSize = size;
            gl_Position = projectionMatrix * mvPos;
          }
        `}
        fragmentShader={`
          varying float vAlpha;

          void main() {
            // Soft circle
            float d = length(gl_PointCoord - 0.5) * 2.0;
            float circle = 1.0 - smoothstep(0.4, 1.0, d);
            if (circle < 0.01) discard;
            gl_FragColor = vec4(0.45, 0.43, 0.48, vAlpha * circle);
          }
        `}
      />
    </points>
  );
}

/* ════════ THIN HELIX LINE ════════ */

function HelixLine() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 600; i++) {
      const t = i / 600;
      const a = t * Math.PI * 2 * REVS;
      pts.push(new THREE.Vector3(Math.cos(a) * R, t * H, Math.sin(a) * R));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, 600, 0.008, 6, false);
  }, []);

  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color="#1d1d1f" transparent opacity={0.25} />
    </mesh>
  );
}

/* ════════ INTERACTIVE NODES ════════ */

function Nodes({ active, onHover }: { active: number | null; onHover: (i: number | null) => void }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const isActive = active === i;
      const target = isActive ? 0.09 : 0.03;
      const s = mesh.scale.x + (target - mesh.scale.x) * 0.1;
      mesh.scale.set(s, s, s);
      const [, baseY] = helixPos(i);
      mesh.position.y = baseY + Math.sin(clock.getElapsedTime() * 0.6 + i * 0.5) * 0.015;
    });
  });

  return (
    <group>
      {titles.map((_, i) => {
        const [x, y, z] = helixPos(i);
        const isActive = active === i;
        return (
          <group key={i} position={[x, y, z]}>
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); onHover(i); }}
              onPointerOut={() => onHover(null)}
            >
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            <mesh ref={(el) => { refs.current[i] = el; }} scale={0.03}>
              <sphereGeometry args={[1, 20, 20]} />
              <meshBasicMaterial
                color={isActive ? "#1d1d1f" : "#999"}
                transparent
                opacity={isActive ? 1 : 0.5}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ════════ CURSOR-REACTIVE AMBIENT ════════ */

function CursorGlow() {
  const ref = useRef<THREE.PointLight>(null);
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    if (ref.current) {
      ref.current.position.x += (pointer.x * viewport.width * 0.3 - ref.current.position.x) * 0.02;
      ref.current.position.z += (-pointer.y * viewport.height * 0.3 - ref.current.position.z) * 0.02;
    }
  });

  return <pointLight ref={ref} position={[0, 4, 0]} intensity={0.08} color="#c8c0d8" distance={10} />;
}

/* ════════ SCROLL BLOCKER ════════ */

function BlockScroll() {
  const { gl } = useThree();
  useEffect(() => {
    const c = gl.domElement;
    const b = (e: WheelEvent) => { e.preventDefault(); e.stopPropagation(); };
    c.addEventListener("wheel", b, { passive: false });
    return () => c.removeEventListener("wheel", b);
  }, [gl]);
  return null;
}

/* ════════ SCENE ════════ */

function Scene({ active, onHover }: { active: number | null; onHover: (i: number | null) => void }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 8, 5]} intensity={0.25} />
      <CursorGlow />

      <fog attach="fog" args={["#fbfbfd", 14, 28]} />

      <ParticleField active={active} />
      <HelixLine />
      <Nodes active={active} onHover={onHover} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.12}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        enableDamping
        dampingFactor={0.03}
        rotateSpeed={0.35}
        target={[0, H * 0.45, 0]}
      />

      <BlockScroll />
    </>
  );
}

/* ════════ EXPORT ════════ */

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
        minHeight: 480,
        maxHeight: 720,
        position: "relative",
        marginTop: 48,
        marginBottom: 48,
        cursor: "grab",
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      <Canvas
        camera={{ position: [5, 4, 6], fov: 48 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2, alpha: true }}
        style={{ position: "absolute", inset: 0, touchAction: "none" }}
        onPointerMissed={() => setActive(null)}
      >
        <Scene active={active} onHover={handleHover} />
      </Canvas>

      {/* Tooltip */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: `translateX(-50%) translateY(${active !== null ? 0 : 6}px)`,
          transition: "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: active !== null ? 1 : 0,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {active !== null && (
          <div
            style={{
              background: "rgba(29,29,31,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 10,
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 10, color: "#666", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
              {String(active + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
              {titles[active]}
            </span>
          </div>
        )}
      </div>

      {active === null && (
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 10 }}>
          <p style={{ fontSize: 11, color: "var(--lighter)", margin: 0 }}>
            Glissez pour explorer
          </p>
        </div>
      )}
    </div>
  );
}
