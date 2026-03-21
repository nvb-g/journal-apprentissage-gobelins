"use client";

import { useState, useEffect, useRef } from "react";

const data = [
  { date: "1 oct.", title: "Introduction", learning: "Choix du sujet, premières intuitions sur l'importance de la typographie", y: 5 },
  { date: "14 oct.", title: "L'origine de la typographie", learning: "Étymologie, définition, la double nature du mot", y: 12 },
  { date: "27 oct.", title: "L'imprimerie et la transmission", learning: "De la xylographie chinoise à Gutenberg, la typographie comme véhicule du contenu", y: 22 },
  { date: "9 nov.", title: "Les premiers typographes", learning: "Jenson, Manuce, Griffo, Tory, la rupture avec le gothique", y: 30 },
  { date: "22 nov.", title: "Claude Garamont", learning: "Le contexte parisien des années 1530, Vervliet, les Grecs du Roi", y: 38 },
  { date: "5 déc.", title: "La standardisation", learning: "Moxon, le Romain du Roi, Fournier, Bodoni, la typographie comme enjeu de pouvoir", y: 45 },
  { date: "18 déc.", title: "La classification typographique", learning: "Vox-ATypI, les onze familles, chaque police porte une histoire", y: 55 },
  { date: "31 déc.", title: "Le dessin typographique", learning: "Anatomie des lettres, vocabulaire technique, familles typographiques", y: 62 },
  { date: "12 jan.", title: "La typographie sur internet", learning: "PostScript, TrueType, OpenType, @font-face, Google Fonts, polices variables", y: 70 },
  { date: "23 jan.", title: "Les fonderies modernes", learning: "Le marché, Monotype, les indépendants, le coût de création d'une police", y: 76 },
  { date: "3 fév.", title: "Licences typographiques", learning: "Desktop, web, app, les modèles de tarification, la protection juridique", y: 80 },
  { date: "13 fév.", title: "Cocotte", learning: "Présentation du logiciel développé en parallèle de l'apprentissage", y: 85 },
  { date: "22 fév.", title: "L'association de polices", learning: "Principes de contraste et de cohérence, erreurs courantes", y: 89 },
  { date: "1 mars", title: "Typographie et identité de marque", learning: "Polices sur-mesure, IBM Plex, Parisine, le rôle stratégique", y: 93 },
  { date: "8 mars", title: "OpenType et fonctionnalités avancées", learning: "Ligatures, petites capitales, chiffres elzéviriens, variantes stylistiques", y: 96 },
  { date: "15 mars", title: "Conclusion", learning: "Bilan de l'apprentissage, ce que la typographie a changé dans ma manière de voir", y: 100 },
];

/* Typographic glyphs scattered along the curve */
const glyphs = ["A", "g", "R", "fi", "&", "Q", "e", "Aa", "Rg", "T", "Hx", "Gg", "ff", "Kt", "Oo", "§"];

export default function LearningCurve() {
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const w = 960;
  const h = 480;
  const px = 60;
  const pt = 60;
  const pb = 60;
  const chartW = w - px * 2;
  const chartH = h - pt - pb;

  const points = data.map((d, i) => ({
    ...d,
    x: px + (i / (data.length - 1)) * chartW,
    cy: pt + chartH - (d.y / 100) * chartH,
    idx: i,
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.cy}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.5;
    const cpx2 = prev.x + (p.x - prev.x) * 0.5;
    return `${acc} C ${cpx1} ${prev.cy}, ${cpx2} ${p.cy}, ${p.x} ${p.cy}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${pt + chartH} L ${points[0].x} ${pt + chartH} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    const y = ((e.clientY - rect.top) / rect.height) * h;
    setMousePos({ x, y });

    // Find nearest point
    let nearest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - x);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    if (minDist < chartW / data.length) {
      setActive(nearest);
    }
  };

  return (
    <div className="w-full py-16 -mx-6 px-6 sm:-mx-12 sm:px-12 lg:-mx-20 lg:px-20">
      <h3 className="text-2xl font-semibold text-[var(--black)] tracking-tight text-center mb-1">
        Courbe d&apos;apprentissage
      </h3>
      <p className="text-sm text-[var(--light)] text-center mb-8">
        16 articles &middot; Octobre 2025 &mdash; Mars 2026
      </p>

      {/* SVG Graph */}
      <div className="w-full overflow-hidden rounded-xl bg-white border border-[#f0f0f2]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActive(null)}
          style={{ cursor: "crosshair" }}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--black)" stopOpacity={0.06} />
              <stop offset="100%" stopColor="var(--black)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--lighter)" />
              <stop offset="40%" stopColor="var(--dark)" />
              <stop offset="100%" stopColor="var(--black)" />
            </linearGradient>
          </defs>

          {/* Subtle grid */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = pt + chartH - (v / 100) * chartH;
            return (
              <line
                key={v}
                x1={px}
                y1={y}
                x2={w - px}
                y2={y}
                stroke="var(--lighter)"
                strokeWidth={0.5}
                opacity={0.5}
              />
            );
          })}

          {/* Floating typographic glyphs — generative scatter */}
          {points.map((p, i) => {
            const offsetX = (i % 3 === 0 ? -1 : 1) * (12 + (i * 7) % 20);
            const offsetY = (i % 2 === 0 ? -1 : 1) * (15 + (i * 11) % 25);
            const opacity = mounted ? (active === i ? 0.25 : 0.06) : 0;
            const size = 11 + (i * 3) % 8;
            return (
              <text
                key={`glyph-${i}`}
                x={p.x + offsetX}
                y={p.cy + offsetY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--dark)"
                fontSize={size}
                fontWeight={500}
                fontStyle={i % 3 === 0 ? "italic" : "normal"}
                opacity={opacity}
                style={{
                  transition: "opacity 400ms ease-out",
                  userSelect: "none",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
              >
                {glyphs[i]}
              </text>
            );
          })}

          {/* Area fill */}
          <path
            d={areaD}
            fill="url(#areaGrad)"
            style={{
              transition: "opacity 600ms ease-out",
              opacity: mounted ? 1 : 0,
            }}
          />

          {/* Main curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#curveGrad)"
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              strokeDasharray: mounted ? "none" : 2000,
              strokeDashoffset: mounted ? 0 : 2000,
              transition: "stroke-dashoffset 1.5s ease-out",
            }}
          />

          {/* Vertical scan line following cursor */}
          {active !== null && (
            <line
              x1={points[active].x}
              y1={pt}
              x2={points[active].x}
              y2={pt + chartH}
              stroke="var(--black)"
              strokeWidth={0.5}
              opacity={0.12}
            />
          )}

          {/* Horizontal scan line */}
          {active !== null && (
            <line
              x1={px}
              y1={points[active].cy}
              x2={points[active].x}
              y2={points[active].cy}
              stroke="var(--black)"
              strokeWidth={0.5}
              opacity={0.12}
              strokeDasharray="4 4"
            />
          )}

          {/* Points */}
          {points.map((p, i) => {
            const isActive = active === i;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.cy}
                  r={isActive ? 6 : 3}
                  fill={isActive ? "var(--black)" : "var(--dark)"}
                  style={{
                    transition: "r 200ms ease-out, fill 200ms ease-out",
                  }}
                />
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.cy}
                    r={12}
                    fill="none"
                    stroke="var(--black)"
                    strokeWidth={1}
                    opacity={0.15}
                  />
                )}
              </g>
            );
          })}

          {/* Active point label */}
          {active !== null && (() => {
            const p = points[active];
            const labelW = 240;
            let lx = p.x - labelW / 2;
            if (lx < px) lx = px;
            if (lx + labelW > w - px) lx = w - px - labelW;
            const above = p.cy > pt + 80;
            const ly = above ? p.cy - 52 : p.cy + 20;

            return (
              <foreignObject x={lx} y={ly} width={labelW} height={48}>
                <div
                  style={{
                    background: "var(--black)",
                    color: "white",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    lineHeight: 1.4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  }}
                >
                  <span style={{ opacity: 0.5, marginRight: 6 }}>{p.date}</span>
                  {p.title}
                </div>
              </foreignObject>
            );
          })()}

          {/* Axis labels */}
          {points.map((p, i) => {
            if (i !== 0 && i !== points.length - 1 && i % 3 !== 0) return null;
            return (
              <text
                key={`ax-${i}`}
                x={p.x}
                y={h - 20}
                textAnchor="middle"
                fill="var(--light)"
                fontSize={10}
                fontWeight={500}
                style={{ userSelect: "none" }}
              >
                {p.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Detail list below */}
      <div className="mt-8 space-y-0">
        {data.map((item, i) => {
          const isActive = active === i;
          return (
            <button
              key={i}
              onClick={() => setActive(isActive ? null : i)}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className="w-full text-left"
              style={{ minHeight: 40 }}
            >
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{
                  transitionProperty: "background-color, transform",
                  transitionDuration: "200ms",
                  transitionTimingFunction: "ease-out",
                  backgroundColor: isActive ? "#f5f5f7" : "transparent",
                  transform: isActive ? "scale(1)" : "scale(1)",
                }}
              >
                <span
                  className="text-[11px] font-semibold tabular-nums shrink-0 w-5 text-right"
                  style={{
                    transition: "color 200ms ease-out",
                    color: isActive ? "var(--black)" : "var(--lighter)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Mini progress dot */}
                <div className="relative w-2 h-2 shrink-0">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      transition: "all 200ms ease-out",
                      backgroundColor: isActive ? "var(--black)" : "var(--lighter)",
                      transform: isActive ? "scale(1.5)" : "scale(1)",
                    }}
                  />
                </div>

                <span
                  className="text-[13px] font-medium flex-1 truncate"
                  style={{
                    transition: "color 200ms ease-out",
                    color: isActive ? "var(--black)" : "var(--mid)",
                  }}
                >
                  {item.title}
                </span>

                <span
                  className="text-[11px] tabular-nums shrink-0 hidden sm:block"
                  style={{
                    transition: "color 200ms ease-out",
                    color: isActive ? "var(--dark)" : "var(--lighter)",
                  }}
                >
                  {item.date}
                </span>
              </div>

              {/* Expanded detail */}
              <div
                className="overflow-hidden"
                style={{
                  transitionProperty: "max-height, opacity",
                  transitionDuration: "250ms",
                  transitionTimingFunction: "ease-out",
                  maxHeight: isActive ? 50 : 0,
                  opacity: isActive ? 1 : 0,
                }}
              >
                <p className="text-[12px] text-[var(--light)] leading-relaxed pl-[52px] pr-4 pb-2">
                  {item.learning}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
