import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { ARTICLES_QUERY } from "@/sanity/lib/queries";

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

export default async function SommairePage() {
  const articles = await client.fetch(ARTICLES_QUERY);

  return (
    <div className="max-w-[640px] mx-auto px-6 min-h-screen flex flex-col">
      <div className="pt-20 pb-10">
        <Link
          href="/"
          className="inline-block text-sm text-[var(--light)] font-medium hover:text-[var(--black)] active:scale-[0.97] transition-all duration-150 py-2 px-3 -mx-3 rounded-lg mb-8"
        >
          ← Retour
        </Link>
        <h1 className="text-[2rem] font-semibold tracking-tight text-[var(--black)] leading-tight">
          Table des matières
        </h1>
      </div>

      <div className="flex-1">
        <ol className="pb-20">
          {articles?.map(
            (
              article: {
                _id: string;
                title: string;
                slug: string;
                date: string;
                order: number;
              },
              i: number
            ) => (
              <li key={article._id}>
                <Link
                  href={`/${article.slug}`}
                  className="group flex items-baseline gap-4 py-3.5 border-b border-[#f0f0f2] active:scale-[0.995] transition-all duration-150"
                >
                  <span className="text-[13px] text-[var(--lighter)] font-semibold tabular-nums shrink-0 w-[24px] text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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
        Nicolas Giannantonio — Gobelins 2026
      </footer>
    </div>
  );
}
