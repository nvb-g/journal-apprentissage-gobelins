import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { SETTINGS_QUERY, ARTICLES_QUERY } from "@/sanity/lib/queries";

function formatDateShort(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return "";
  return date
    .toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    .replace(".", "");
}

export const revalidate = 60;

export default async function Home() {
  const [settings, articles] = await Promise.all([
    client.fetch(SETTINGS_QUERY),
    client.fetch(ARTICLES_QUERY),
  ]);

  return (
    <div className="max-w-[640px] mx-auto px-6 min-h-[100dvh] flex flex-col">
      <header className="pt-24 pb-16">
        <p className="text-[13px] text-[var(--light)] mb-4">
          Mastère ECNI, Gobelins 2026
        </p>
        <h1 className="text-[2rem] font-semibold text-[var(--black)] leading-[1.15] tracking-tight">
          Typographie
        </h1>
        <p className="text-[15px] text-[var(--light)] leading-relaxed mt-4 max-w-[480px]">
          Journal d&apos;apprentissage par Nicolas Giannantonio.
        </p>
        <div className="flex items-center gap-4 mt-6">
          {settings?.softwareLink && (
            <a
              href={settings.softwareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[var(--black)] font-medium hover:opacity-60 transition-opacity duration-200"
            >
              Cocotte &#8599;
            </a>
          )}
          <span className="text-[var(--lighter)]">·</span>
          <Link
            href="/sommaire"
            className="text-[13px] text-[var(--light)] hover:text-[var(--black)] transition-colors duration-200"
          >
            Sommaire
          </Link>
        </div>
      </header>

      <div className="flex-1">
        <ol>
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
                  className="group flex items-baseline gap-4 py-3 border-b border-[var(--border)]"
                >
                  <span className="text-[11px] text-[var(--lighter)] font-medium tabular-nums shrink-0 w-5 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] text-[var(--light)] tabular-nums shrink-0 w-[70px]">
                    {formatDateShort(article.date)}
                  </span>
                  <span className="text-[15px] font-medium text-[var(--dark)] group-hover:text-[var(--black)] transition-colors duration-200">
                    {article.title}
                  </span>
                </Link>
              </li>
            )
          )}
        </ol>
      </div>

      <footer className="py-10 mt-12 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--lighter)]">
          {settings?.footer || "Nicolas Giannantonio"}
        </p>
      </footer>
    </div>
  );
}
