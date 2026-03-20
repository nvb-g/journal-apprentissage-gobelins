import { defineQuery } from "next-sanity";

export const SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings"][0]{ title, subtitle, softwareLink, softwareName, footer }`
);

export const ARTICLES_QUERY = defineQuery(
  `*[_type == "article"] | order(order asc) { _id, title, "slug": slug.current, date, excerpt, order }`
);

export const ARTICLE_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{ _id, title, "slug": slug.current, date, excerpt, order, body }`
);

export const ARTICLE_SLUGS_QUERY = defineQuery(
  `*[_type == "article" && defined(slug.current)]{ "slug": slug.current }`
);

export const ADJACENT_ARTICLES_QUERY = defineQuery(
  `{
    "prev": *[_type == "article" && order < $order] | order(order desc)[0]{ title, "slug": slug.current },
    "next": *[_type == "article" && order > $order] | order(order asc)[0]{ title, "slug": slug.current }
  }`
);
