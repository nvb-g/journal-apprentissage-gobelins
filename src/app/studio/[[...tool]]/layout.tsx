export { metadata, viewport } from "next-sanity/studio";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: "100vh",
        maxHeight: "100dvh",
        overscrollBehavior: "none",
        WebkitFontSmoothing: "antialiased",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
