"use client";

import { useState } from "react";

const data = [
  {
    date: "1 oct. 2025",
    title: "Introduction",
    learning:
      "Choix du sujet, premières intuitions sur l'importance de la typographie",
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
    learning:
      "De la xylographie chinoise à Gutenberg, comprendre que la typographie est le véhicule du contenu",
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
    learning:
      "Le contexte parisien des années 1530, Vervliet, les Grecs du Roi",
    y: 38,
  },
  {
    date: "5 déc. 2025",
    title: "La standardisation",
    learning:
      "Moxon, le Romain du Roi, Fournier, Bodoni, la typographie comme enjeu de pouvoir",
    y: 45,
  },
  {
    date: "18 déc. 2025",
    title: "La classification typographique",
    learning:
      "Vox-ATypI, les onze familles, chaque police porte une histoire",
    y: 55,
  },
  {
    date: "31 déc. 2025",
    title: "Le dessin typographique",
    learning:
      "Anatomie des lettres, vocabulaire technique, familles typographiques",
    y: 62,
  },
  {
    date: "12 jan. 2026",
    title: "La typographie sur internet",
    learning:
      "PostScript, TrueType, OpenType, @font-face, Google Fonts, polices variables",
    y: 70,
  },
  {
    date: "23 jan. 2026",
    title: "Les fonderies modernes",
    learning:
      "Le marché, Monotype, les indépendants, le coût de création d'une police",
    y: 76,
  },
  {
    date: "3 fév. 2026",
    title: "Licences typographiques",
    learning:
      "Desktop, web, app, les modèles de tarification, la protection juridique",
    y: 80,
  },
  {
    date: "13 fév. 2026",
    title: "Cocotte",
    learning:
      "Présentation du logiciel développé en parallèle de l'apprentissage",
    y: 85,
  },
  {
    date: "22 fév. 2026",
    title: "L'association de polices",
    learning: "Principes de contraste et de cohérence, erreurs courantes",
    y: 89,
  },
  {
    date: "1 mars 2026",
    title: "Typographie et identité de marque",
    learning:
      "Polices sur-mesure, IBM Plex, Parisine, le rôle stratégique de la typographie",
    y: 93,
  },
  {
    date: "8 mars 2026",
    title: "OpenType et fonctionnalités avancées",
    learning:
      "Ligatures, petites capitales, chiffres elzéviriens, variantes stylistiques",
    y: 96,
  },
  {
    date: "15 mars 2026",
    title: "Conclusion",
    learning:
      "Bilan de l'apprentissage, ce que la typographie a changé dans ma manière de voir",
    y: 100,
  },
];

export default function LearningCurve() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="w-full py-12">
      <h3 className="text-xl font-semibold text-[var(--black)] tracking-tight text-center mb-1">
        Courbe d&apos;apprentissage
      </h3>
      <p className="text-sm text-[var(--light)] text-center mb-10">
        Octobre 2025 &mdash; Mars 2026
      </p>

      {/* Timeline list */}
      <div className="space-y-0">
        {data.map((item, i) => {
          const isActive = active === i;
          const progress = item.y;

          return (
            <button
              key={i}
              onClick={() => setActive(isActive ? null : i)}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className="w-full text-left group"
              style={{
                /* ux-fitts-target-size: min 44px touch target */
                minHeight: 44,
              }}
            >
              <div
                className="flex items-center gap-4 px-4 py-3 rounded-lg transition-colors"
                style={{
                  /* duration-small-state: 200ms for state changes */
                  transitionDuration: "200ms",
                  /* easing-entrance-ease-out */
                  transitionTimingFunction: "ease-out",
                  background: isActive ? "var(--card-bg, #f5f5f7)" : "transparent",
                }}
              >
                {/* Number */}
                <span
                  className="text-xs font-semibold tabular-nums shrink-0 w-6 text-right transition-colors"
                  style={{
                    transitionDuration: "200ms",
                    color: isActive ? "var(--black)" : "var(--lighter)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Progress bar */}
                <div className="w-16 h-1 rounded-full bg-[#e8e8ed] shrink-0 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      transitionDuration: "300ms",
                      transitionTimingFunction: "ease-out",
                      background: isActive ? "var(--black)" : "var(--light)",
                    }}
                  />
                </div>

                {/* Title */}
                <span
                  className="text-[14px] font-medium flex-1 transition-colors truncate"
                  style={{
                    transitionDuration: "200ms",
                    color: isActive ? "var(--black)" : "var(--dark)",
                  }}
                >
                  {item.title}
                </span>

                {/* Date */}
                <span className="text-xs text-[var(--light)] tabular-nums shrink-0 hidden sm:block">
                  {item.date}
                </span>
              </div>

              {/* Expandable detail — progressive disclosure */}
              <div
                className="overflow-hidden transition-all"
                style={{
                  /* easing-entrance-ease-out for reveal */
                  transitionDuration: "250ms",
                  transitionTimingFunction: "ease-out",
                  maxHeight: isActive ? 60 : 0,
                  opacity: isActive ? 1 : 0,
                }}
              >
                <p className="text-[13px] text-[var(--mid)] leading-relaxed pl-[104px] pr-4 pb-3">
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
