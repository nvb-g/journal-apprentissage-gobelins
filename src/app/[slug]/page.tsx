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
      <p className="mb-5 text-base font-normal text-[var(--dark)] leading-[1.7]">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-[var(--black)] mt-8 mb-3 tracking-tight">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 italic text-[var(--mid)] text-lg leading-relaxed text-center">
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
        className="underline underline-offset-3 hover:text-[var(--black)] transition-colors"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-5 space-y-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-5 space-y-2">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="text-base text-[var(--dark)] leading-[1.7]">{children}</li>
    ),
    number: ({ children }) => (
      <li className="text-base text-[var(--dark)] leading-[1.7]">{children}</li>
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
    <div className="max-w-[640px] mx-auto px-6">
      <div className="pt-20 pb-10 text-center">
        <Link
          href="/"
          className="inline-block text-sm text-[var(--light)] font-medium hover:text-[var(--black)] transition-colors mb-8"
        >
          ← Retour
        </Link>
        <h1 className="text-[1.65rem] font-semibold text-[var(--black)] tracking-tight leading-tight mb-3">
          {article.title}
        </h1>
        <div className="text-[13px] text-[var(--light)] font-medium">
          {formatDate(article.date)}
        </div>
      </div>

      <div className="pb-24">
        {article.body && (
          <PortableText value={article.body} components={components} />
        )}
        {slug === "conclusion" && <LearningCurve />}
      </div>

      <div className="flex justify-between py-10 border-t border-[#f5f5f7] gap-5">
        {adjacent?.prev ? (
          <Link
            href={`/${adjacent.prev.slug}`}
            className="text-sm text-[var(--light)] font-medium hover:text-[var(--black)] transition-colors"
          >
            ← {adjacent.prev.title}
          </Link>
        ) : (
          <span />
        )}
        {adjacent?.next ? (
          <Link
            href={`/${adjacent.next.slug}`}
            className="text-sm text-[var(--light)] font-medium hover:text-[var(--black)] transition-colors text-right"
          >
            {adjacent.next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>

      <footer className="text-center py-10 text-xs text-[var(--lighter)] font-medium">
        Nicolas Giannantonio — Gobelins 2026
      </footer>
    </div>
  );
}
