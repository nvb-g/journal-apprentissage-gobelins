"use client";

import { useState } from "react";

const data = [
  {
    date: "1 oct. 2025",
    title: "Introduction",
    learning: "Choix du sujet, premières intuitions sur l'importance de la typographie",
    y: 5,
  },
  {
    date: "14 oct. 2025",
    title: "L'origine de la typographie",
    learning: "Étymologie, définition, la double nature du mot",
    y: 12,
  },
  {
    date: "27 oct. 2025",
    title: "L'imprimerie et la transmission",
    learning: "De la xylographie chinoise à Gutenberg, comprendre que la typographie est le véhicule du contenu",
    y: 22,
  },
  {
    date: "9 nov. 2025",
    title: "Les premiers typographes",
    learning: "Jenson, Manuce, Griffo, Tory, la rupture avec le gothique",
    y: 30,
  },
  {
    date: "22 nov. 2025",
    title: "Claude Garamont",
    learning: "Le contexte parisien des années 1530, Vervliet, les Grecs du Roi",
    y: 38,
  },
  {
    date: "5 déc. 2025",
    title: "La standardisation",
    learning: "Moxon, le Romain du Roi, Fournier, Bodoni, la typographie comme enjeu de pouvoir",
    y: 45,
  },
  {
    date: "18 déc. 2025",
    title: "La classification typographique",
    learning: "Vox-ATypI, les onze familles, chaque police porte une histoire",
    y: 55,
  },
  {
    date: "31 déc. 2025",
    title: "Le dessin typographique",
    learning: "Anatomie des lettres, vocabulaire technique, familles typographiques",
    y: 62,
  },
  {
    date: "13 jan. 2026",
    title: "La typographie sur internet",
    learning: "PostScript, TrueType, OpenType, @font-face, Google Fonts, polices variables",
    y: 70,
  },
  {
    date: "26 jan. 2026",
    title: "Les fonderies modernes",
    learning: "Le marché, Monotype, les indépendants, le coût de création d'une police",
    y: 76,
  },
  {
    date: "8 fév. 2026",
    title: "Licences typographiques",
    learning: "Desktop, web, app, les modèles de tarification, la protection juridique",
    y: 80,
  },
  {
    date: "21 fév. 2026",
    title: "Cocotte",
    learning: "Présentation du logiciel développé en parallèle de l'apprentissage",
    y: 85,
  },
  {
    date: "6 mars 2026",
    title: "L'association de polices",
    learning: "Principes de contraste et de cohérence, erreurs courantes",
    y: 89,
  },
  {
    date: "8 mars 2026",
    title: "Typographie et identité de marque",
    learning: "Polices sur-mesure, IBM Plex, Parisine, le rôle stratégique de la typographie",
    y: 93,
  },
  {
    date: "12 mars 2026",
    title: "OpenType et fonctionnalités avancées",
    learning: "Ligatures, petites capitales, chiffres elzéviriens, variantes stylistiques",
    y: 96,
  },
  {
    date: "15 mars 2026",
    title: "Conclusion",
    learning: "Bilan de l'apprentissage, ce que la typographie a changé dans ma manière de voir",
    y: 100,
  },
];

export default function LearningCurve() {
  const [active, setActive] = useState<number | null>(null);

  const width = 900;
  const height = 300;
  const padX = 40;
  const padTop = 20;
  const padBottom = 40;

  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const points = data.map((d, i) => ({
    ...d,
    x: padX + (i / (data.length - 1)) * chartW,
    cy: padTop + chartH - (d.y / 100) * chartH,
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.cy}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = prev.x + (p.x - prev.x) * 0.6;
    return `${acc} C ${cpx1} ${prev.cy}, ${cpx2} ${p.cy}, ${p.x} ${p.cy}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  return (
    <div className="w-full py-16">
      <h3 className="text-lg font-semibold text-[var(--black)] tracking-tight text-center mb-2">
        Courbe d&apos;apprentissage
      </h3>
      <p className="text-sm text-[var(--light)] text-center mb-10">
        Octobre 2025 &mdash; 15 mars 2026
      </p>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px] h-auto"
          role="img"
          aria-label="Courbe d'apprentissage typographique d'octobre 2025 à mars 2026"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = padTop + chartH - (v / 100) * chartH;
            return (
              <line
                key={v}
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="var(--lighter)"
                strokeWidth={0.5}
              />
            );
          })}

          {/* Area fill */}
          <path
            d={areaD}
            fill="var(--dark)"
            opacity={0.04}
          />

          {/* Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--dark)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />

          {/* Vertical indicator line for active point */}
          {active !== null && (
            <line
              x1={points[active].x}
              y1={points[active].cy}
              x2={points[active].x}
              y2={padTop + chartH}
              stroke="var(--dark)"
              strokeWidth={0.5}
              strokeDasharray="3 3"
              opacity={0.4}
            />
          )}

          {/* Points + hit areas */}
          {points.map((p, i) => (
            <g
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              onMouseEnter={() => setActive(i)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`${data[i].title} — ${data[i].date}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(active === i ? null : i);
                }
              }}
            >
              {/* Invisible hit area — generous for touch */}
              <circle
                cx={p.x}
                cy={p.cy}
                r={22}
                fill="transparent"
              />
              {/* Outer ring on active */}
              {active === i && (
                <circle
                  cx={p.x}
                  cy={p.cy}
                  r={8}
                  fill="none"
                  stroke="var(--dark)"
                  strokeWidth={1}
                  opacity={0.25}
                />
              )}
              {/* Visible dot */}
              <circle
                cx={p.x}
                cy={p.cy}
                r={active === i ? 4 : 2.5}
                fill={active === i ? "var(--black)" : "var(--dark)"}
                className="transition-all duration-150"
              />
            </g>
          ))}

          {/* Date labels — first, last, and every 4th */}
          {points.map((p, i) => {
            if (i !== 0 && i !== points.length - 1 && i % 4 !== 0) return null;
            return (
              <text
                key={`label-${i}`}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[9px] fill-[var(--light)]"
                style={{ userSelect: "none" }}
              >
                {p.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Detail panel below chart */}
      <div
        className="mt-6 mx-auto overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxWidth: 560,
          maxHeight: active !== null ? 120 : 0,
          opacity: active !== null ? 1 : 0,
        }}
      >
        {active !== null && (
          <div className="border-t border-[var(--lighter)] pt-4 px-1">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-semibold text-[var(--black)] leading-snug">
                {data[active].title}
              </p>
              <p className="text-xs text-[var(--light)] whitespace-nowrap shrink-0">
                {data[active].date}
              </p>
            </div>
            <p className="text-sm text-[var(--mid)] leading-relaxed mt-1">
              {data[active].learning}
            </p>
          </div>
        )}
      </div>

      {/* Hint */}
      {active === null && (
        <p className="text-xs text-[var(--lighter)] text-center mt-4 transition-opacity duration-300">
          Cliquez sur un point pour voir le d&eacute;tail
        </p>
      )}
    </div>
  );
}
