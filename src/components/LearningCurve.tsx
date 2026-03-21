"use client";

import { useState, useRef, useEffect } from "react";

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

const glyphs = ["A", "g", "R", "fi", "&", "Q", "e", "Aa", "Rg", "T", "Hx", "Gg", "ff", "Kt", "Oo", "§"];

export default function LearningCurve() {
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Layout: full viewport, graph takes ~65% height, list takes ~35%
  const graphRatio = 0.62;

  // SVG dimensions (aspect ratio, actual size is CSS-driven)
  const vw = 1600;
  const vh = 700;
  const mx = 100; // margin x
  const mt = 80;  // margin top
  const mb = 70;  // margin bottom
  const cw = vw - mx * 2;
  const ch = vh - mt - mb;

  const points = data.map((d, i) => ({
    ...d,
    x: mx + (i / (data.length - 1)) * cw,
    cy: mt + ch - (d.y / 100) * ch,
    idx: i,
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.cy}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) * 0.5;
    const cx2 = prev.x + (p.x - prev.x) * 0.5;
    return `${acc} C ${cx1} ${prev.cy}, ${cx2} ${p.cy}, ${p.x} ${p.cy}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${mt + ch} L ${points[0].x} ${mt + ch} Z`;

  const handleSvgMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * vw;

    let nearest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - x);
      if (dist < minDist) { minDist = dist; nearest = i; }
    });
    setActive(nearest);
  };

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen flex flex-col relative left-1/2 -translate-x-1/2 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* ─── TOP: GRAPH ─── */}
      <div
        className="relative flex-none"
        style={{ height: `${graphRatio * 100}%` }}
      >
        {/* Title overlay — top left */}
        <div className="absolute top-6 left-8 z-10">
          <h3 className="text-xl font-semibold text-[var(--black)] tracking-tight leading-none">
            Courbe d&apos;apprentissage
          </h3>
          <p className="text-xs text-[var(--light)] mt-1.5">
            16 articles &middot; Oct. 2025 &mdash; Mars 2026
          </p>
        </div>

        {/* Active detail overlay — top right */}
        <div
          className="absolute top-6 right-8 z-10 text-right"
          style={{
            transition: "opacity 200ms ease-out",
            opacity: active !== null ? 1 : 0,
          }}
        >
          {active !== null && (
            <>
              <p className="text-xs text-[var(--light)] tabular-nums">{data[active].date}</p>
              <p className="text-base font-semibold text-[var(--black)] mt-0.5 leading-tight max-w-[300px] ml-auto">
                {data[active].title}
              </p>
              <p className="text-xs text-[var(--mid)] mt-1 max-w-[340px] ml-auto leading-relaxed">
                {data[active].learning}
              </p>
            </>
          )}
        </div>

        {/* SVG fills the graph area */}
        <svg
          viewBox={`0 0 ${vw} ${vh}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          onMouseMove={handleSvgMove}
          onTouchMove={handleSvgMove}
          onMouseLeave={() => setActive(null)}
          style={{ cursor: "crosshair" }}
        >
          <defs>
            <linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--black)" stopOpacity={0.05} />
              <stop offset="100%" stopColor="var(--black)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--lighter)" />
              <stop offset="30%" stopColor="var(--mid)" />
              <stop offset="100%" stopColor="var(--black)" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = mt + ch - (v / 100) * ch;
            return <line key={v} x1={mx} y1={y} x2={vw - mx} y2={y} stroke="var(--lighter)" strokeWidth={0.5} opacity={0.4} />;
          })}

          {/* Floating serif glyphs */}
          {points.map((p, i) => {
            const ox = (i % 3 === 0 ? -1 : 1) * (15 + (i * 7) % 30);
            const oy = (i % 2 === 0 ? -1 : 1) * (20 + (i * 11) % 35);
            const size = 14 + (i * 3) % 12;
            return (
              <text
                key={`g${i}`}
                x={p.x + ox}
                y={p.cy + oy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--dark)"
                fontSize={size}
                fontWeight={400}
                fontStyle={i % 3 === 0 ? "italic" : "normal"}
                opacity={mounted ? (active === i ? 0.3 : 0.04) : 0}
                style={{
                  transition: "opacity 400ms ease-out",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                {glyphs[i]}
              </text>
            );
          })}

          {/* Area */}
          <path d={areaD} fill="url(#aFill)" opacity={mounted ? 1 : 0} style={{ transition: "opacity 800ms ease-out" }} />

          {/* Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#cStroke)"
            strokeWidth={2.5}
            strokeLinecap="round"
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: mounted ? 0 : 3000,
              transition: "stroke-dashoffset 2s ease-out",
            }}
          />

          {/* Crosshair lines */}
          {active !== null && (
            <>
              <line x1={points[active].x} y1={mt} x2={points[active].x} y2={mt + ch} stroke="var(--black)" strokeWidth={0.5} opacity={0.1} />
              <line x1={mx} y1={points[active].cy} x2={points[active].x} y2={points[active].cy} stroke="var(--black)" strokeWidth={0.5} opacity={0.08} strokeDasharray="6 4" />
            </>
          )}

          {/* Dots */}
          {points.map((p, i) => (
            <g key={i}>
              {active === i && <circle cx={p.x} cy={p.cy} r={14} fill="var(--black)" opacity={0.06} />}
              <circle
                cx={p.x}
                cy={p.cy}
                r={active === i ? 5 : 2.5}
                fill={active === i ? "var(--black)" : "var(--dark)"}
                style={{ transition: "r 150ms ease-out" }}
              />
            </g>
          ))}

          {/* X axis dates */}
          {points.map((p, i) => {
            if (i !== 0 && i !== points.length - 1 && i % 3 !== 0) return null;
            return (
              <text key={`d${i}`} x={p.x} y={vh - 20} textAnchor="middle" fill="var(--light)" fontSize={13} fontWeight={500} style={{ userSelect: "none" }}>
                {p.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* ─── BOTTOM: SCROLLABLE LIST ─── */}
      <div
        className="flex-1 overflow-y-auto border-t border-[#ebebed]"
        style={{ minHeight: 0 }}
      >
        <div className="max-w-[900px] mx-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            {data.map((item, i) => {
              const isActive = active === i;
              return (
                <button
                  key={i}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive(isActive ? null : i)}
                  className="w-full text-left flex items-center gap-2.5 py-2 px-2 rounded-md"
                  style={{
                    minHeight: 36,
                    transition: "background-color 150ms ease-out",
                    backgroundColor: isActive ? "#f0f0f2" : "transparent",
                  }}
                >
                  <span
                    className="text-[10px] font-semibold tabular-nums w-4 text-right shrink-0"
                    style={{ color: isActive ? "var(--black)" : "var(--lighter)", transition: "color 150ms ease-out" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: isActive ? "var(--black)" : "var(--lighter)",
                      transform: isActive ? "scale(1.6)" : "scale(1)",
                      transition: "all 150ms ease-out",
                    }}
                  />
                  <span
                    className="text-[12px] font-medium truncate flex-1"
                    style={{ color: isActive ? "var(--black)" : "var(--mid)", transition: "color 150ms ease-out" }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="text-[10px] tabular-nums shrink-0"
                    style={{ color: isActive ? "var(--dark)" : "var(--lighter)", transition: "color 150ms ease-out" }}
                  >
                    {item.date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
