"use client";

import { useState, useEffect } from "react";

const data = [
  { date: "Oct. 2025", title: "Introduction", y: 5 },
  { date: "", title: "L'origine de la typographie", y: 12 },
  { date: "", title: "L'imprimerie et la transmission", y: 22 },
  { date: "Nov.", title: "Les premiers typographes", y: 30 },
  { date: "", title: "Claude Garamont", y: 38 },
  { date: "", title: "La standardisation", y: 45 },
  { date: "Déc.", title: "La classification typographique", y: 55 },
  { date: "", title: "Le dessin typographique", y: 62 },
  { date: "Jan. 2026", title: "La typographie sur internet", y: 70 },
  { date: "", title: "Les fonderies modernes", y: 76 },
  { date: "Fév.", title: "Licences typographiques", y: 80 },
  { date: "", title: "Cocotte", y: 85 },
  { date: "", title: "L'association de polices", y: 89 },
  { date: "Mars", title: "Typographie et identité de marque", y: 93 },
  { date: "", title: "OpenType", y: 96 },
  { date: "", title: "Conclusion", y: 100 },
];

export default function LearningCurve() {
  const [active, setActive] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(t);
  }, []);

  const w = 800;
  const h = 400;
  const pad = { l: 0, r: 0, t: 40, b: 40 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;

  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * cw,
    y: pad.t + ch - (d.y / 100) * ch,
  }));

  const line = pts.reduce((s, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx = prev.x + (p.x - prev.x) * 0.5;
    return `${s} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  return (
    <div className="w-screen h-screen relative left-1/2 -translate-x-1/2 flex flex-col items-center justify-center px-8 py-12">

      {/* Graph — centered, clean */}
      <div className="w-full max-w-[820px] flex-1 flex flex-col justify-center">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto"
          onMouseLeave={() => setActive(null)}
        >
          {/* Curve */}
          <path
            d={line}
            fill="none"
            stroke="var(--black)"
            strokeWidth={1.5}
            strokeLinecap="round"
            style={{
              strokeDasharray: 2000,
              strokeDashoffset: drawn ? 0 : 2000,
              transition: "stroke-dashoffset 2s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          />

          {/* Points + invisible hit areas */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y} r={24}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(active === i ? null : i)}
                style={{ cursor: "pointer" }}
              />
              <circle
                cx={p.x} cy={p.y}
                r={active === i ? 4 : 2}
                fill="var(--black)"
                style={{ transition: "r 200ms ease-out" }}
              />
            </g>
          ))}

          {/* Active: vertical line down to label area */}
          {active !== null && (
            <line
              x1={pts[active].x} y1={pts[active].y + 8}
              x2={pts[active].x} y2={h - pad.b + 8}
              stroke="var(--black)" strokeWidth={0.5} opacity={0.15}
            />
          )}

          {/* Date ticks along bottom */}
          {data.map((d, i) => {
            if (!d.date) return null;
            return (
              <text
                key={i}
                x={pts[i].x} y={h - 10}
                textAnchor="middle"
                fill="var(--light)"
                fontSize={11}
                fontWeight={500}
                style={{ userSelect: "none" }}
              >
                {d.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Active article title — large, centered below */}
      <div className="h-20 flex items-center justify-center text-center">
        <p
          className="text-lg font-medium text-[var(--black)] tracking-tight"
          style={{
            transition: "opacity 200ms ease-out",
            opacity: active !== null ? 1 : 0.3,
          }}
        >
          {active !== null ? data[active].title : "Survolez la courbe"}
        </p>
      </div>
    </div>
  );
}
