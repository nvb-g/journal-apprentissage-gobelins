import { defineType, defineField } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Extrait",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "order",
      title: "Ordre",
      type: "number",
    }),
    defineField({
      name: "body",
      title: "Contenu",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          fields: [
            defineField({
              name: "caption",
              title: "Légende",
              type: "string",
            }),
            defineField({
              name: "alt",
              title: "Texte alternatif",
              type: "string",
            }),
          ],
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Ordre",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      order: "order",
    },
    prepare({ title, date, order }) {
      return {
        title,
        subtitle: `#${order} — ${date}`,
      };
    },
  },
});
