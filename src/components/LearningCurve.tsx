"use client";

import { useState, useEffect } from "react";

const data = [
  { date: "1 oct. 2025", title: "Introduction", learning: "Choix du sujet, premières intuitions sur l'importance de la typographie", y: 5 },
  { date: "14 oct. 2025", title: "L'origine de la typographie", learning: "Étymologie, définition, la double nature du mot", y: 12 },
  { date: "27 oct. 2025", title: "L'imprimerie et la transmission", learning: "De la xylographie chinoise à Gutenberg, la typographie comme véhicule du contenu", y: 22 },
  { date: "9 nov. 2025", title: "Les premiers typographes", learning: "Jenson, Manuce, Griffo, Tory, la rupture avec le gothique", y: 30 },
  { date: "22 nov. 2025", title: "Claude Garamont", learning: "Le contexte parisien des années 1530, Vervliet, les Grecs du Roi", y: 38 },
  { date: "5 déc. 2025", title: "La standardisation", learning: "Moxon, le Romain du Roi, Fournier, Bodoni, la typographie comme enjeu de pouvoir", y: 45 },
  { date: "18 déc. 2025", title: "La classification typographique", learning: "Vox-ATypI, les onze familles, chaque police porte une histoire", y: 55 },
  { date: "31 déc. 2025", title: "Le dessin typographique", learning: "Anatomie des lettres, vocabulaire technique, familles typographiques", y: 62 },
  { date: "12 jan. 2026", title: "La typographie sur internet", learning: "PostScript, TrueType, OpenType, @font-face, Google Fonts, polices variables", y: 70 },
  { date: "23 jan. 2026", title: "Les fonderies modernes", learning: "Le marché, Monotype, les indépendants, le coût de création d'une police", y: 76 },
  { date: "3 fév. 2026", title: "Licences typographiques", learning: "Desktop, web, app, les modèles de tarification, la protection juridique", y: 80 },
  { date: "13 fév. 2026", title: "Cocotte", learning: "Développement du logiciel en parallèle de l'apprentissage", y: 85 },
  { date: "22 fév. 2026", title: "L'association de polices", learning: "Principes de contraste et de cohérence, erreurs courantes", y: 89 },
  { date: "1 mars 2026", title: "Typographie et identité de marque", learning: "Polices sur-mesure, IBM Plex, Parisine, le rôle stratégique", y: 93 },
  { date: "8 mars 2026", title: "OpenType", learning: "Ligatures, petites capitales, chiffres elzéviriens, variantes stylistiques", y: 96 },
  { date: "15 mars 2026", title: "Conclusion", learning: "Bilan de l'apprentissage, ce que la typographie a changé dans ma manière de voir", y: 100 },
];

const months = [
  { label: "Oct.", idx: 0 },
  { label: "Nov.", idx: 3 },
  { label: "Déc.", idx: 6 },
  { label: "Jan.", idx: 8 },
  { label: "Fév.", idx: 10 },
  { label: "Mars", idx: 13 },
];

export default function LearningCurve() {
  const [active, setActive] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 400);
    return () => clearTimeout(t);
  }, []);

  const w = 960;
  const h = 420;
  const mx = 50;
  const mt = 50;
  const mb = 50;
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

  const area = `${curve} L${pts[pts.length - 1].x},${mt + ch} L${pts[0].x},${mt + ch} Z`;

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
    <div className="w-screen h-screen relative left-1/2 -translate-x-1/2 flex flex-col">

      {/* Header */}
      <div className="flex items-baseline justify-between px-8 pt-8 pb-2">
        <div>
          <h3 className="text-xl font-semibold text-[var(--black)] tracking-tight">
            Courbe d&apos;apprentissage
          </h3>
          <p className="text-[13px] text-[var(--light)] mt-0.5">
            16 articles, octobre 2025 — mars 2026
          </p>
        </div>
        {active !== null && (
          <p className="text-[13px] text-[var(--light)] tabular-nums">
            {String(active + 1).padStart(2, "0")}/{data.length}
          </p>
        )}
      </div>

      {/* Graph */}
      <div className="flex-1 px-4 min-h-0">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMove}
          onMouseLeave={() => setActive(null)}
          style={{ cursor: "crosshair" }}
        >
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--black)" stopOpacity={0.04} />
              <stop offset="100%" stopColor="var(--black)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Light horizontal grid */}
          {[25, 50, 75].map(v => {
            const y = mt + ch - (v / 100) * ch;
            return <line key={v} x1={mx} y1={y} x2={w - mx} y2={y} stroke="var(--lighter)" strokeWidth={0.5} opacity={0.5} />;
          })}

          {/* Area */}
          <path
            d={area} fill="url(#fill)"
            opacity={drawn ? 1 : 0}
            style={{ transition: "opacity 1s ease-out" }}
          />

          {/* Curve */}
          <path
            d={curve} fill="none" stroke="var(--black)" strokeWidth={1.5} strokeLinecap="round"
            style={{
              strokeDasharray: 2500,
              strokeDashoffset: drawn ? 0 : 2500,
              transition: "stroke-dashoffset 2s cubic-bezier(.4,0,.2,1)",
            }}
          />

          {/* Vertical indicator */}
          {active !== null && (
            <line
              x1={pts[active].x} y1={pts[active].y + 6}
              x2={pts[active].x} y2={mt + ch}
              stroke="var(--black)" strokeWidth={0.5} opacity={0.1}
            />
          )}

          {/* Points */}
          {pts.map((p, i) => (
            <circle
              key={i} cx={p.x} cy={p.y}
              r={active === i ? 5 : 2.5}
              fill={active === i ? "var(--black)" : "var(--dark)"}
              opacity={active === i ? 1 : 0.6}
              style={{ transition: "all 200ms ease-out" }}
            />
          ))}

          {/* Active label on curve */}
          {active !== null && (() => {
            const p = pts[active];
            const above = p.y > mt + 50;
            const ty = above ? p.y - 30 : p.y + 18;
            return (
              <text
                x={p.x}
                y={ty}
                textAnchor="middle"
                fill="var(--black)"
                fontSize={12}
                fontWeight={600}
                style={{ userSelect: "none", transition: "opacity 150ms ease-out" }}
              >
                {data[active].title}
              </text>
            );
          })()}

          {/* Month labels */}
          {months.map(m => (
            <text
              key={m.label}
              x={pts[m.idx].x} y={h - 12}
              textAnchor="middle"
              fill="var(--light)" fontSize={11} fontWeight={500}
              style={{ userSelect: "none" }}
            >
              {m.label}
            </text>
          ))}

          {/* Baseline */}
          <line x1={mx} y1={mt + ch} x2={w - mx} y2={mt + ch} stroke="var(--lighter)" strokeWidth={0.5} />
        </svg>
      </div>

      {/* Bottom detail card */}
      <div className="px-8 pb-8">
        <div
          className="max-w-[700px] mx-auto rounded-xl overflow-hidden"
          style={{
            transition: "all 300ms ease-out",
            backgroundColor: active !== null ? "#f5f5f7" : "transparent",
            padding: active !== null ? "20px 24px" : "20px 24px",
            opacity: active !== null ? 1 : 0,
            transform: active !== null ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {active !== null && (
            <div className="flex items-start gap-5">
              {/* Number */}
              <span className="text-3xl font-semibold text-[var(--lighter)] tabular-nums leading-none mt-0.5">
                {String(active + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[15px] font-semibold text-[var(--black)] leading-snug">
                    {data[active].title}
                  </p>
                  <p className="text-xs text-[var(--light)] tabular-nums shrink-0">
                    {data[active].date}
                  </p>
                </div>
                <p className="text-[13px] text-[var(--mid)] leading-relaxed mt-1.5">
                  {data[active].learning}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hint when nothing is hovered */}
        {active === null && (
          <p
            className="text-center text-xs text-[var(--lighter)] mt-2"
            style={{ transition: "opacity 300ms ease-out" }}
          >
            Survolez la courbe pour explorer les articles
          </p>
        )}
      </div>
    </div>
  );
}
