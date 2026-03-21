"use client";

import { useState, useEffect } from "react";

const data = [
  { date: "1 oct.", title: "Introduction", y: 5 },
  { date: "14 oct.", title: "L'origine de la typographie", y: 12 },
  { date: "27 oct.", title: "L'imprimerie et la transmission", y: 22 },
  { date: "9 nov.", title: "Les premiers typographes", y: 30 },
  { date: "22 nov.", title: "Claude Garamont", y: 38 },
  { date: "5 déc.", title: "La standardisation", y: 45 },
  { date: "18 déc.", title: "La classification typographique", y: 55 },
  { date: "31 déc.", title: "Le dessin typographique", y: 62 },
  { date: "12 jan.", title: "La typographie sur internet", y: 70 },
  { date: "23 jan.", title: "Les fonderies modernes", y: 76 },
  { date: "3 fév.", title: "Licences typographiques", y: 80 },
  { date: "13 fév.", title: "Cocotte", y: 85 },
  { date: "22 fév.", title: "L'association de polices", y: 89 },
  { date: "1 mars", title: "Typographie et identité de marque", y: 93 },
  { date: "8 mars", title: "OpenType", y: 96 },
  { date: "15 mars", title: "Conclusion", y: 100 },
];

export default function LearningCurve() {
  const [active, setActive] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(t);
  }, []);

  const w = 680;
  const h = 280;
  const mx = 0;
  const mt = 24;
  const mb = 24;
  const cw = w - mx * 2;
  const ch = h - mt - mb;

  const pts = data.map((d, i) => ({
    x: mx + (i / (data.length - 1)) * cw,
    y: mt + ch - (d.y / 100) * ch,
  }));

  const curve = pts.reduce((s, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx = prev.x + (p.x - prev.x) * 0.5;
    return `${s} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    let nearest = 0;
    let min = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < min) { min = d; nearest = i; }
    });
    setActive(nearest);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-[13px] text-[var(--light)]">
          Courbe d&apos;apprentissage
        </p>
        <p
          className="text-[13px] text-[var(--light)] tabular-nums"
          style={{ opacity: active !== null ? 1 : 0, transition: "opacity 150ms" }}
        >
          {active !== null && `${String(active + 1).padStart(2, "0")}/${data.length}`}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto"
        onMouseMove={handleMove}
        onMouseLeave={() => setActive(null)}
        style={{ cursor: "crosshair" }}
      >
        {/* Curve */}
        <path
          d={curve}
          fill="none"
          stroke="var(--dark)"
          strokeWidth={1.2}
          strokeLinecap="round"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: drawn ? 0 : 2000,
            transition: "stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1)",
          }}
        />

        {/* Vertical indicator */}
        {active !== null && (
          <line
            x1={pts[active].x}
            y1={pts[active].y + 6}
            x2={pts[active].x}
            y2={mt + ch}
            stroke="var(--border)"
            strokeWidth={1}
          />
        )}

        {/* Points */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={active === i ? 4 : 1.8}
            fill={active === i ? "var(--black)" : "var(--light)"}
            style={{ transition: "all 150ms ease-out" }}
          />
        ))}

        {/* Label on active point */}
        {active !== null && (() => {
          const p = pts[active];
          const above = p.y > mt + 28;
          return (
            <text
              x={p.x}
              y={above ? p.y - 14 : p.y + 22}
              textAnchor="middle"
              fill="var(--dark)"
              fontSize={11}
              fontWeight={500}
              style={{ userSelect: "none" }}
            >
              {data[active].title}
            </text>
          );
        })()}
      </svg>

      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-[var(--lighter)]">Oct. 2025</span>
        <span className="text-[10px] text-[var(--lighter)]">Mars 2026</span>
      </div>
    </div>
  );
}
