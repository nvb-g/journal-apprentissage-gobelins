import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Journal d'apprentissage — Typographie",
  description:
    "Journal d'apprentissage sur la typographie, réalisé dans le cadre du Mastère ECNI aux Gobelins, 2026. Par Nicolas Giannantonio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
