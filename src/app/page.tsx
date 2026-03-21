import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { SETTINGS_QUERY, ARTICLES_QUERY } from "@/sanity/lib/queries";

function formatDateShort(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return "";
  return date
    .toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(".", "");
}

export const revalidate = 60;

export default async function Home() {
  const [settings, articles] = await Promise.all([
    client.fetch(SETTINGS_QUERY),
    client.fetch(ARTICLES_QUERY),
  ]);

  return (
    <div className="max-w-[680px] mx-auto px-6 min-h-[100dvh] flex flex-col">
      {/* ── HEADER ── */}
      <header className="pt-32 pb-20 md:pt-40 md:pb-24">
        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--black)] leading-[1.05]">
          Typo-graphie.
        </h1>
        <p className="text-[15px] text-[var(--light)] leading-[1.65] mt-6 max-w-[520px]">
          {settings?.subtitle ||
            "Journal d'apprentissage sur la typographie, r\u00e9alis\u00e9 dans le cadre du Mast\u00e8re ECNI aux Gobelins, 2026. Par Nicolas Giannantonio."}
        </p>

        <div className="flex items-center gap-5 mt-8">
          {settings?.softwareLink && (
            <a
              href={settings.softwareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--black)] text-white text-[13px] font-medium rounded-md active:scale-[0.98] transition-transform duration-150 hover:bg-[var(--dark)]"
              style={{
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              {settings?.softwareName || "Cocotte"}
              <span className="opacity-40 text-[11px]">&nearr;</span>
            </a>
          )}
          <Link
            href="/sommaire"
            className="text-[13px] text-[var(--light)] font-medium hover:text-[var(--black)] transition-colors duration-200 underline underline-offset-[3px] decoration-[var(--border)]"
          >
            Sommaire
          </Link>
        </div>
      </header>

      {/* ── ARTICLE LIST ── */}
      <div className="flex-1">
        <ol className="pb-24">
          {articles?.map(
            (
              article: {
                _id: string;
                title: string;
                slug: string;
                date: string;
              },
              i: number
            ) => (
              <li key={article._id}>
                <Link
                  href={`/${article.slug}`}
                  className="group flex items-baseline gap-5 py-3.5 border-b border-[var(--border)]"
                  style={
                    {
                      "--index": i,
                    } as React.CSSProperties
                  }
                >
                  <span className="text-[11px] text-[var(--lighter)] font-semibold tabular-nums shrink-0 w-5 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] text-[var(--light)] tabular-nums shrink-0 w-[90px]">
                    {formatDateShort(article.date)}
                  </span>
                  <span
                    className="text-[15px] font-medium text-[var(--dark)] group-hover:text-[var(--black)] transition-colors duration-200"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {article.title}
                  </span>
                </Link>
              </li>
            )
          )}
        </ol>
      </div>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--lighter)] font-medium">
          {settings?.footer || "Nicolas Giannantonio \u2014 Gobelins 2026"}
        </p>
      </footer>
    </div>
  );
}
