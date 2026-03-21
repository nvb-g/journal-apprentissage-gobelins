import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import {
  ARTICLE_QUERY,
  ARTICLE_SLUGS_QUERY,
  ADJACENT_ARTICLES_QUERY,
} from "@/sanity/lib/queries";
import { PortableText } from "@portabletext/react";
import type { PortableTextReactComponents } from "@portabletext/react";
import LearningCurve from "@/components/LearningCurve";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const components: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-[16px] text-[var(--dark)] leading-[1.75] max-w-[65ch]">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="text-[19px] font-semibold text-[var(--black)] mt-10 mb-4">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-10 pl-5 border-l-2 border-[var(--border)] italic text-[var(--mid)] text-[17px] leading-[1.7]">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[var(--black)]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-[3px] decoration-[var(--border)] hover:decoration-[var(--dark)] hover:text-[var(--black)] transition-colors duration-200"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="text-[16px] text-[var(--dark)] leading-[1.75]">
        {children}
      </li>
    ),
    number: ({ children }) => (
      <li className="text-[16px] text-[var(--dark)] leading-[1.75]">
        {children}
      </li>
    ),
  },
};

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch(ARTICLE_SLUGS_QUERY);
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await client.fetch(ARTICLE_QUERY, { slug });
  if (!article) notFound();

  const adjacent = await client.fetch(ADJACENT_ARTICLES_QUERY, {
    order: article.order,
  });

  return (
    <div className="max-w-[680px] mx-auto px-6">
      {/* ── HEADER ── */}
      <div className="pt-32 pb-12 md:pt-40 md:pb-16">
        <Link
          href="/"
          className="inline-block text-[12px] text-[var(--light)] font-mono hover:text-[var(--black)] transition-colors duration-200 mb-12"
        >
          &larr; Retour
        </Link>

        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-[11px] text-[var(--lighter)] font-medium font-mono">
            {String(article.order).padStart(2, "0")}
          </span>
          <span className="text-[12px] text-[var(--light)] font-mono">
            {formatDate(article.date)}
          </span>
        </div>

        <h1 className="text-[1.75rem] md:text-[2rem] font-semibold text-[var(--black)] leading-[1.15] tracking-tight">
          {article.title}
        </h1>
      </div>

      {/* ── BODY ── */}
      <article className="pb-20">
        {article.body && (
          <PortableText value={article.body} components={components} />
        )}
      </article>

      {slug === "conclusion" && <LearningCurve />}

      {/* ── NAV ── */}
      <nav className="flex justify-between py-10 border-t border-[var(--border)] gap-6">
        {adjacent?.prev ? (
          <Link
            href={`/${adjacent.prev.slug}`}
            className="group flex flex-col gap-1 min-h-[44px] justify-center"
          >
            <span className="text-[10px] text-[var(--lighter)] font-mono">
              Pr&eacute;c&eacute;dent
            </span>
            <span className="text-[14px] text-[var(--light)] font-medium group-hover:text-[var(--black)] transition-colors duration-200">
              {adjacent.prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {adjacent?.next ? (
          <Link
            href={`/${adjacent.next.slug}`}
            className="group flex flex-col gap-1 text-right min-h-[44px] justify-center"
          >
            <span className="text-[10px] text-[var(--lighter)] font-mono">
              Suivant
            </span>
            <span className="text-[14px] text-[var(--light)] font-medium group-hover:text-[var(--black)] transition-colors duration-200">
              {adjacent.next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--lighter)] font-medium">
          Nicolas Giannantonio &mdash; Gobelins 2026
        </p>
      </footer>
    </div>
  );
}
