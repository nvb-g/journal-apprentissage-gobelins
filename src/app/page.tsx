import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { SETTINGS_QUERY, ARTICLES_QUERY } from "@/sanity/lib/queries";

function formatDateShort(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).replace(".", "");
}

export const revalidate = 60;

export default async function Home() {
  const [settings, articles] = await Promise.all([
    client.fetch(SETTINGS_QUERY),
    client.fetch(ARTICLES_QUERY),
  ]);

  return (
    <div className="max-w-[640px] mx-auto px-6 min-h-screen flex flex-col">
      <header className="pt-24 pb-16">
        <h1 className="text-[2.8rem] font-semibold tracking-tight text-[var(--black)] leading-[1.1]">
          Typo-graphie.
        </h1>
        <p className="text-[15px] text-[var(--light)] leading-relaxed mt-5 max-w-[480px]">
          {settings?.subtitle ||
            "Journal d'apprentissage sur la typographie, réalisé dans le cadre du Mastère ECNI aux Gobelins, 2026. Par Nicolas Giannantonio."}
        </p>
        {settings?.softwareLink && (
          <a
            href={settings.softwareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-5 py-2 bg-[var(--black)] text-white text-[13px] font-medium rounded-full hover:bg-[var(--dark)] active:scale-[0.97] transition-all duration-150"
          >
            {settings?.softwareName || "Cocotte"}
          </a>
        )}
        <div className="mt-4">
          <Link
            href="/sommaire"
            className="text-[13px] text-[var(--light)] font-medium hover:text-[var(--black)] transition-colors duration-150 underline underline-offset-3"
          >
            Table des matières
          </Link>
        </div>
      </header>

      <div className="flex-1">
        <ol className="pb-20">
          {articles?.map(
            (article: {
              _id: string;
              title: string;
              slug: string;
              date: string;
            }) => (
              <li key={article._id}>
                <Link
                  href={`/${article.slug}`}
                  className="group flex items-baseline gap-4 py-3 border-b border-[#f0f0f2] active:scale-[0.995] transition-all duration-150"
                >
                  <span className="text-[13px] text-[var(--light)] font-medium tabular-nums shrink-0 w-[100px]">
                    {formatDateShort(article.date)}
                  </span>
                  <span className="text-[15px] font-medium text-[var(--dark)] group-hover:text-[var(--black)] transition-colors duration-150">
                    {article.title}
                  </span>
                </Link>
              </li>
            )
          )}
        </ol>
      </div>

      <footer className="py-10 text-xs text-[var(--lighter)] font-medium">
        {settings?.footer || "Nicolas Giannantonio — Gobelins 2026"}
      </footer>
    </div>
  );
}
