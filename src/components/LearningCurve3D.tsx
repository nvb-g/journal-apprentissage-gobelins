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

/* ════════ 80K PARTICLES ════════ */

function ParticleCloud({ active }: { active: number | null }) {
  const COUNT = 80000;
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const t = Math.random();
      const a = t * Math.PI * 2 * REVS;
      const spread = Math.pow(Math.random(), 0.6) * 3.0;
      const ao = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * R + Math.cos(ao) * spread;
      pos[i * 3 + 1] = t * H + (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(a) * R + Math.sin(ao) * spread;
      rnd[i] = Math.random();
    }
    return { positions: pos, randoms: rnd };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uActiveY: { value: -1.0 },
  }), []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
      matRef.current.uniforms.uActiveY.value = active !== null ? (active / (N - 1)) * H : -1.0;
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
          uniform float uActiveY;
          varying float vAlpha;

          void main() {
            vec3 pos = position;
            pos.x += sin(uTime * 0.12 + aRandom * 40.0) * 0.1;
            pos.y += cos(uTime * 0.1 + aRandom * 30.0) * 0.07;
            pos.z += sin(uTime * 0.08 + aRandom * 50.0) * 0.1;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            float dist = length(mv.xyz);
            float size = (2.0 + aRandom * 3.5) * (1.0 / max(dist, 1.0));

            float alpha = 0.15 + aRandom * 0.15;

            if (uActiveY >= 0.0) {
              float prox = 1.0 - smoothstep(0.0, 2.0, abs(pos.y - uActiveY));
              alpha += prox * 0.6;
              size += prox * 4.0;
            }

            vAlpha = alpha;
            gl_PointSize = size;
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            float c = 1.0 - smoothstep(0.3, 1.0, d);
            if (c < 0.01) discard;
            gl_FragColor = vec4(0.7, 0.68, 0.75, vAlpha * c);
          }
        `}
      />
    </points>
  );
}

/* ════════ HELIX LINE ════════ */

function HelixLine() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 600; i++) {
      const t = i / 600;
      const a = t * Math.PI * 2 * REVS;
      pts.push(new THREE.Vector3(Math.cos(a) * R, t * H, Math.sin(a) * R));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, 600, 0.012, 6, false);
  }, []);

  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color="#fff" transparent opacity={0.15} />
    </mesh>
  );
}

/* ════════ NODES ════════ */

function Nodes({ active, onHover }: { active: number | null; onHover: (i: number | null) => void }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const isA = active === i;
      const s = mesh.scale.x + ((isA ? 0.1 : 0.035) - mesh.scale.x) * 0.1;
      mesh.scale.set(s, s, s);
      const [, baseY] = helixPos(i);
      mesh.position.y = baseY + Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.02;
    });
  });

  return (
    <group>
      {titles.map((_, i) => {
        const [x, y, z] = helixPos(i);
        return (
          <group key={i} position={[x, y, z]}>
            <mesh onPointerOver={(e) => { e.stopPropagation(); onHover(i); }} onPointerOut={() => onHover(null)}>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            <mesh ref={(el) => { refs.current[i] = el; }} scale={0.035}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#fff" transparent opacity={active === i ? 1 : 0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ════════ CURSOR LIGHT ════════ */

function CursorLight() {
  const ref = useRef<THREE.PointLight>(null);
  const { viewport } = useThree();
  useFrame(({ pointer }) => {
    if (ref.current) {
      ref.current.position.x += (pointer.x * viewport.width * 0.3 - ref.current.position.x) * 0.02;
      ref.current.position.z += (-pointer.y * viewport.height * 0.3 - ref.current.position.z) * 0.02;
    }
  });
  return <pointLight ref={ref} position={[0, 4, 0]} intensity={0.1} color="#c0b8d8" distance={10} />;
}

/* ════════ SCROLL BLOCK ════════ */

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
      <color attach="background" args={["#0a0a0c"]} />
      <fog attach="fog" args={["#0a0a0c", 12, 24]} />
      <ambientLight intensity={0.08} />
      <CursorLight />
      <ParticleCloud active={active} />
      <HelixLine />
      <Nodes active={active} onHover={onHover} />
      <OrbitControls
        autoRotate autoRotateSpeed={0.12}
        enableZoom={false} enablePan={false}
        enableRotate enableDamping dampingFactor={0.03} rotateSpeed={0.35}
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
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        height: "70vh",
        minHeight: 500,
        maxHeight: 750,
        position: "relative",
        marginTop: 48,
        marginBottom: 48,
        cursor: "grab",
        borderRadius: 16,
        overflow: "hidden",
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      <Canvas
        camera={{ position: [5, 4, 6], fov: 48 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
        style={{ position: "absolute", inset: 0, touchAction: "none" }}
        onPointerMissed={() => setActive(null)}
      >
        <Scene active={active} onHover={handleHover} />
      </Canvas>

      {/* Tooltip */}
      <div
        style={{
          position: "absolute", bottom: 24, left: "50%",
          transform: `translateX(-50%) translateY(${active !== null ? 0 : 6}px)`,
          transition: "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: active !== null ? 1 : 0,
          pointerEvents: "none", zIndex: 10,
        }}
      >
        {active !== null && (
          <div style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderRadius: 10, padding: "10px 18px",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
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
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            Glissez pour explorer
          </p>
        </div>
      )}
    </div>
  );
}
