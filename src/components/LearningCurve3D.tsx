"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ──────── DATA ──────── */

const articles = [
  "Introduction",
  "L'origine de la typographie",
  "L'imprimerie et la transmission",
  "Les premiers typographes",
  "Claude Garamont",
  "La standardisation",
  "La classification typographique",
  "Le dessin typographique",
  "La typographie sur internet",
  "Les fonderies modernes",
  "Licences typographiques",
  "Cocotte",
  "L'association de polices",
  "Typographie et identité",
  "OpenType",
  "Conclusion",
];

const N = articles.length;

/* ──────── CUSTOM SHADER MATERIAL ──────── */

const vertexShader = `
  uniform float uTime;
  uniform float uHover; // -1 = none, 0..15 = index
  varying vec2 vUv;
  varying float vElevation;
  varying float vProgress;

  //
  // Simplex 3D noise
  //
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main() {
    vUv = uv;

    // Helix parameters
    float t = uv.x; // progress along tube
    vProgress = t;

    vec3 pos = position;

    // Organic displacement — FBM noise
    float n1 = snoise(pos * 1.5 + uTime * 0.12) * 0.08;
    float n2 = snoise(pos * 3.0 + uTime * 0.08) * 0.03;
    float displacement = n1 + n2;

    pos += normal * displacement;
    vElevation = displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;
  varying float vElevation;
  varying float vProgress;

  void main() {
    // Gradient: dark base to slightly lighter
    vec3 colorA = vec3(0.12, 0.12, 0.14); // dark
    vec3 colorB = vec3(0.35, 0.33, 0.38); // mid
    vec3 colorC = vec3(0.55, 0.52, 0.58); // light

    float t = vProgress;
    vec3 color = mix(colorA, colorB, smoothstep(0.0, 0.5, t));
    color = mix(color, colorC, smoothstep(0.5, 1.0, t));

    // Subtle shimmer from elevation
    color += vElevation * 1.5;

    // Fresnel-like edge glow
    float edge = pow(1.0 - abs(vUv.y - 0.5) * 2.0, 2.0);
    color += edge * 0.05;

    gl_FragColor = vec4(color, 0.85);
  }
`;

/* ──────── ORGANIC TUBE ──────── */

function OrganicHelix() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry } = useMemo(() => {
    const REVS = 2.2, R = 2.5, H = 7;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 500; i++) {
      const t = i / 500;
      const a = t * Math.PI * 2 * REVS;
      pts.push(new THREE.Vector3(Math.cos(a) * R, t * H, Math.sin(a) * R));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    const geometry = new THREE.TubeGeometry(curve, 500, 0.06, 12, false);
    return { geometry, curve };
  }, []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        uniforms={{
          uTime: { value: 0 },
          uHover: { value: -1 },
        }}
      />
    </mesh>
  );
}

/* ──────── NODES ──────── */

function helixPos(i: number): THREE.Vector3 {
  const t = i / (N - 1);
  const REVS = 2.2, R = 2.5, H = 7;
  const a = t * Math.PI * 2 * REVS;
  return new THREE.Vector3(Math.cos(a) * R, t * H, Math.sin(a) * R);
}

function DataNodes({
  active,
  onHover,
}: {
  active: number | null;
  onHover: (i: number | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    nodesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const isActive = active === i;
      const target = isActive ? 0.11 : 0.04;
      const s = mesh.scale.x + (target - mesh.scale.x) * 0.1;
      mesh.scale.set(s, s, s);

      // Subtle float
      const base = helixPos(i);
      mesh.position.y = base.y + Math.sin(clock.getElapsedTime() * 0.8 + i * 0.4) * 0.02;
    });
  });

  return (
    <group ref={groupRef}>
      {articles.map((_, i) => {
        const pos = helixPos(i);
        return (
          <group key={i} position={pos}>
            {/* Hit area */}
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); onHover(i); }}
              onPointerOut={() => onHover(null)}
            >
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            {/* Visible node */}
            <mesh
              ref={(el) => { if (el) nodesRef.current[i] = el; }}
              scale={0.04}
            >
              <sphereGeometry args={[1, 20, 20]} />
              <meshStandardMaterial
                color={active === i ? "#fff" : "#ccc"}
                emissive={active === i ? "#fff" : "#555"}
                emissiveIntensity={active === i ? 3 : 0.02}
                roughness={0.15}
                metalness={0.9}
              />
            </mesh>
            {/* Ring pulse on active */}
            {active === i && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.16, 0.18, 32]} />
                <meshBasicMaterial color="#fff" transparent opacity={0.2} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ──────── PARTICLES ──────── */

function FloatingDust({ count = 1500 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      a[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      a[i * 3 + 1] = Math.random() * 10;
      a[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return a;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.005;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.003) * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.008} color="#999" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

/* ──────── CURSOR LIGHT ──────── */

function CursorLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    if (lightRef.current) {
      lightRef.current.position.x += (pointer.x * viewport.width * 0.4 - lightRef.current.position.x) * 0.03;
      lightRef.current.position.z += (-pointer.y * viewport.height * 0.4 - lightRef.current.position.z) * 0.03;
    }
  });

  return <pointLight ref={lightRef} position={[0, 5, 0]} intensity={0.15} color="#e8e0f0" distance={12} />;
}

/* ──────── SCROLL BLOCK ──────── */

function ScrollBlocker() {
  const { gl } = useThree();
  useEffect(() => {
    const c = gl.domElement;
    const block = (e: WheelEvent) => { e.preventDefault(); e.stopPropagation(); };
    c.addEventListener("wheel", block, { passive: false });
    return () => c.removeEventListener("wheel", block);
  }, [gl]);
  return null;
}

/* ──────── SCENE ──────── */

function Scene({ active, onHover }: { active: number | null; onHover: (i: number | null) => void }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[4, 10, 6]} intensity={0.35} />
      <CursorLight />

      <fog attach="fog" args={["#fbfbfd", 16, 32]} />

      <FloatingDust />
      <OrganicHelix />
      <DataNodes active={active} onHover={onHover} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.15}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        enableDamping
        dampingFactor={0.04}
        rotateSpeed={0.4}
        target={[0, 3.5, 0]}
      />

      <ScrollBlocker />
    </>
  );
}

/* ──────── EXPORT ──────── */

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
        camera={{ position: [5.5, 4, 6.5], fov: 48 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          alpha: true,
        }}
        style={{ position: "absolute", inset: 0, touchAction: "none" }}
        onPointerMissed={() => setActive(null)}
      >
        <Scene active={active} onHover={handleHover} />
      </Canvas>

      {/* Label overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: `translateX(-50%) translateY(${active !== null ? 0 : 6}px)`,
          transition: "all 300ms cubic-bezier(0.25, 0, 0, 1)",
          opacity: active !== null ? 1 : 0,
          pointerEvents: "none",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        {active !== null && (
          <div
            style={{
              background: "rgba(29,29,31,0.9)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: 10,
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 11, color: "#666", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
              {String(active + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
              {articles[active]}
            </span>
          </div>
        )}
      </div>

      {/* Hint */}
      {active === null && (
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <p style={{ fontSize: 11, color: "var(--lighter)", margin: 0, letterSpacing: "0.02em" }}>
            Glissez pour tourner &middot; Survolez les points
          </p>
        </div>
      )}
    </div>
  );
}
