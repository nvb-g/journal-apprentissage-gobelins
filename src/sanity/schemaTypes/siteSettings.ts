import { defineType, defineField } from "sanity";
import { CogIcon } from "@sanity/icons";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Paramètres du site",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "title",
      title: "Titre du site",
      type: "string",
    }),
    defineField({
      name: "subtitle",
      title: "Sous-titre",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "softwareLink",
      title: "Lien du logiciel",
      type: "url",
    }),
    defineField({
      name: "softwareName",
      title: "Nom du logiciel",
      type: "string",
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "string",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Paramètres du site" };
    },
  },
});
