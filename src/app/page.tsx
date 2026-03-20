import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { SETTINGS_QUERY, ARTICLES_QUERY } from "@/sanity/lib/queries";

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const revalidate = 60;

export default async function Home() {
  const [settings, articles] = await Promise.all([
    client.fetch(SETTINGS_QUERY),
    client.fetch(ARTICLES_QUERY),
  ]);

  return (
    <div className="max-w-[640px] mx-auto px-6">
      <header className="py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--black)] mb-3">
          {settings?.title || "Journal d'apprentissage sur la typographie"}
        </h1>
        <p className="text-sm font-medium text-[var(--light)] leading-relaxed">
          {settings?.subtitle}
        </p>
        {settings?.softwareLink && (
          <a
            href={settings.softwareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-6 py-2.5 bg-[var(--black)] text-white text-[13px] font-semibold rounded-full hover:bg-[var(--mid)] transition-colors"
          >
            {settings?.softwareName || "Cocotte"}
          </a>
        )}
      </header>

      <div className="w-10 h-px bg-[var(--lighter)] mx-auto mb-12" />

      <ul className="pb-20">
        {articles?.map(
          (article: {
            _id: string;
            title: string;
            slug: string;
            date: string;
            excerpt: string;
          }) => (
            <li key={article._id} className="mb-0.5">
              <Link
                href={`/${article.slug}`}
                className="block py-5 border-b border-[var(--bg)] hover:opacity-70 transition-opacity"
              >
                <div className="text-xs font-medium text-[var(--light)] uppercase tracking-wider mb-1">
                  {formatDate(article.date)}
                </div>
                <div className="text-[17px] font-semibold text-[var(--dark)] tracking-tight">
                  {article.title}
                </div>
                {article.excerpt && (
                  <div className="text-sm text-[var(--light)] mt-1.5 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </div>
                )}
              </Link>
            </li>
          )
        )}
      </ul>

      <footer className="text-center py-10 text-xs text-[var(--lighter)] font-medium">
        {settings?.footer || "Nicolas Giannantonio — Gobelins 2026"}
      </footer>
    </div>
  );
}
